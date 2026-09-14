const NEW_API_USERNAME_MAX = 20;
const NEW_API_USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

export function isUsableNewApiUsername(name: string): boolean {
  return (
    name.length > 0 &&
    name.length <= NEW_API_USERNAME_MAX &&
    NEW_API_USERNAME_RE.test(name)
  );
}

export async function hashNewApiUsername(mezonUserId: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(mezonUserId),
  );
  const hash = [...new Uint8Array(digest)]
    .map((b) => b.toString(36))
    .join("")
    .slice(0, NEW_API_USERNAME_MAX - 3);
  return `mz_${hash}`;
}

export async function getBackendUsernameCandidates(
  username: string,
  mezonUserId: string,
): Promise<string[]> {
  const mezonHandle = username === `user_${mezonUserId}` ? "" : username;
  const idDerived = `mezon_${mezonUserId}`;
  return [
    ...(isUsableNewApiUsername(mezonHandle) ? [mezonHandle] : []),
    ...(isUsableNewApiUsername(idDerived) ? [idDerived] : []),
    await hashNewApiUsername(mezonUserId),
  ];
}
