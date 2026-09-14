import { createHmac, createHash, timingSafeEqual } from "crypto";
import {
  type AdminUserSummary,
  adminCreateUser,
  adminSearchUsers,
  adminUpdateUserPassword,
  deriveSyncPassword,
  loginUser,
} from "@/lib/api";
import { getBackendUsernameCandidates } from "@/lib/backend-identity";
import type { SessionPayloadBase } from "@/lib/auth";

const CHANNEL_APP_MAX_AGE_SECONDS = Number(
  process.env.MEZON_CHANNEL_APP_AUTH_MAX_AGE_SECONDS || 86400,
);
const NEW_API_ADMIN_TOKEN = process.env.NEW_API_ADMIN_TOKEN;

export interface MezonIdentityInput {
  mezonUserId: string;
  username: string;
  displayName: string;
  accessToken: string;
}

export interface MezonChannelAppUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  mezonId?: string;
}

export type MezonChannelAppAuthResult =
  | { ok: true; user: MezonChannelAppUser }
  | { ok: false; error: string };

function timingSafeHexEqual(a: string, b: string): boolean {
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b)) return false;
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function decodeChannelAppHashData(hashData: string): string | null {
  try {
    return Buffer.from(hashData, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function validateMezonChannelAppData(
  appSecret: string | undefined,
  rawHashData: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): MezonChannelAppAuthResult {
  if (!appSecret) return { ok: false, error: "channel_app_not_configured" };
  if (!rawHashData) return { ok: false, error: "missing_hash_data" };

  const delimiter = "&hash=";
  const hashIndex = rawHashData.indexOf(delimiter);
  if (hashIndex < 0) return { ok: false, error: "missing_hash" };

  const queryData = rawHashData.slice(0, hashIndex);
  const receivedHash = rawHashData.slice(hashIndex + delimiter.length);
  const params = new URLSearchParams(queryData);
  const authDate = Number(params.get("auth_date"));
  const userParam = params.get("user");

  if (!receivedHash) return { ok: false, error: "missing_hash" };
  if (!Number.isFinite(authDate)) return { ok: false, error: "invalid_auth_date" };
  if (authDate > nowSeconds || nowSeconds - authDate > CHANNEL_APP_MAX_AGE_SECONDS) {
    return { ok: false, error: "stale_hash_data" };
  }
  if (!userParam) return { ok: false, error: "missing_user" };

  const hashedSecret = createHash("md5").update(appSecret).digest("hex");
  const secretKey = createHmac("sha256", hashedSecret)
    .update("WebAppData")
    .digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(queryData)
    .digest("hex");

  if (!timingSafeHexEqual(computedHash, receivedHash)) {
    return { ok: false, error: "invalid_hash_signature" };
  }

  try {
    const parsed = JSON.parse(userParam) as Record<string, unknown>;
    const id = parsed.id;
    const username = parsed.username;
    const displayName = parsed.display_name ?? parsed.displayName ?? username;

    if ((typeof id !== "string" && typeof id !== "number") || !String(id)) {
      return { ok: false, error: "invalid_user" };
    }
    if (typeof username !== "string" || !username) {
      return { ok: false, error: "invalid_user" };
    }
    if (typeof displayName !== "string" || !displayName) {
      return { ok: false, error: "invalid_user" };
    }

    return {
      ok: true,
      user: {
        id: String(id),
        username,
        displayName,
        avatarUrl: typeof parsed.avatar_url === "string" ? parsed.avatar_url : undefined,
        mezonId: typeof parsed.mezon_id === "string" ? parsed.mezon_id : undefined,
      },
    };
  } catch {
    return { ok: false, error: "invalid_user" };
  }
}

export async function syncMezonIdentitySession(
  identity: MezonIdentityInput,
): Promise<SessionPayloadBase> {
  if (!NEW_API_ADMIN_TOKEN) {
    throw new Error("NEW_API_ADMIN_TOKEN is not configured");
  }

  let newApiUserId: number | null = null;
  let backendUsername = "";
  const candidates = await getBackendUsernameCandidates(
    identity.username,
    identity.mezonUserId,
  );
  let adopted: AdminUserSummary | undefined;

  for (const candidate of candidates) {
    const found = await adminSearchUsers(candidate, {
      adminToken: NEW_API_ADMIN_TOKEN,
    });
    const exact = found.find((u) => u.username === candidate);
    if (exact) {
      if (exact.role !== undefined && exact.role !== 1) {
        throw new Error(`new-api account ${candidate} has refused role ${exact.role}`);
      }
      if (exact.status !== undefined && exact.status !== 1) {
        throw new Error(`new-api account ${candidate} is disabled`);
      }
      adopted = exact;
      break;
    }
  }

  if (adopted) {
    newApiUserId = adopted.id;
    backendUsername = adopted.username;
    const updated = await adminUpdateUserPassword(
      {
        id: adopted.id,
        username: adopted.username,
        display_name: adopted.display_name || identity.displayName,
        password: await deriveSyncPassword(identity.mezonUserId),
        group: adopted.group,
      },
      { adminToken: NEW_API_ADMIN_TOKEN },
    );
    if (updated?.success === false) {
      throw new Error(updated.message ?? "new-api password sync rejected");
    }
  } else {
    const createName = candidates[0];
    const created = await adminCreateUser(
      {
        username: createName,
        display_name: identity.displayName,
        password: await deriveSyncPassword(identity.mezonUserId),
      },
      { adminToken: NEW_API_ADMIN_TOKEN },
    );
    if (created?.success === false) {
      throw new Error(created.message ?? "new-api user create rejected");
    }

    const createdUsers = await adminSearchUsers(createName, {
      adminToken: NEW_API_ADMIN_TOKEN,
    });
    const createdExact = createdUsers.find((u) => u.username === createName);
    if (createdExact) {
      newApiUserId = createdExact.id;
      backendUsername = createName;
    }
  }

  if (!newApiUserId) {
    throw new Error("Failed to sync user with new-api");
  }

  const backendSession = await loginUser(
    backendUsername,
    await deriveSyncPassword(identity.mezonUserId),
  );

  return {
    userId: newApiUserId,
    accessToken: identity.accessToken,
    backendUsername,
    backendAccessToken: backendSession.accessToken,
    backendExpiresAt: backendSession.expiresAt,
    username: identity.username,
    mezonUserId: identity.mezonUserId,
  };
}
