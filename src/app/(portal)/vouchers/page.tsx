import { getSession, isBackendTokenExpiring } from "@/lib/auth";
import { getUserLogs, type LogEntry } from "@/lib/api";
import { formatDate, formatQuota } from "@/lib/quota";
import { Gift } from "lucide-react";
import { redirect } from "next/navigation";
import { VoucherDialog } from "@/components/voucher-dialog";

/** LogTypeTopup = 1 in the backend */
const LOG_TYPE_TOPUP = 1;

export interface ParsedTopUp {
  label: string;
  quota: number | null;
  money: string | null;
}

/**
 * Parse backend log content into a structured top-up record.
 */
// Matches a custom-currency quota amount on either side of its symbol:
// "mzđ500000.000000" (prefix, current backend) or "500000.000000 mzđ" (postfix, older logs).
const CUSTOM_QUOTA_RE = /(?:mzđ\s*([\d.]+)|([\d.]+)\s*mzđ)/i;

export function parseTopUp(content: string): ParsedTopUp {
  // Voucher redeem: "通过兑换码充值 mzđ500000.000000 额度，兑换码ID 97"
  if (content.includes("兑换码")) {
    const m = content.match(CUSTOM_QUOTA_RE);
    const value = m ? (m[1] ?? m[2]) : null;
    return {
      label: "Nạp bằng voucher",
      quota: value ? Math.round(Number(value)) : null,
      money: null,
    };
  }

  // Mezon on-chain: "Mezon top-up successful: transferred 1000000 dong, credited mzđ1000000 (1:1), tx ..."
  if (content.includes("Mezon top-up")) {
    const qm = content.match(CUSTOM_QUOTA_RE);
    const dm = content.match(/transferred\s+([\d.]+)\s*dong/i);
    const qvalue = qm ? (qm[1] ?? qm[2]) : null;
    return {
      label: "Nạp qua Mezon",
      quota: qvalue ? Math.round(Number(qvalue)) : null,
      money: dm ? `${Number(dm[1]).toLocaleString("vi-VN")}đ` : null,
    };
  }

  // Waffo Pancake: "Waffo Pancake充值成功，充值额度: mzđ500000.000000，支付金额: %.2f"
  if (content.includes("Waffo") || content.includes("Pancake")) {
    const qm = content.match(/充值额度[:：]\s*mzđ?\s*([\d.]+)|充值额度[:：]\s*([\d.]+)\s*mzđ/i);
    const dm = content.match(/支付金额[:：]\s*([\d.]+)/);
    const qvalue = qm ? (qm[1] ?? qm[2]) : null;
    return {
      label: "Nạp qua Waffo Pancake",
      quota: qvalue ? Math.round(Number(qvalue)) : null,
      money: dm ? `${Number(dm[1]).toLocaleString("vi-VN")}đ` : null,
    };
  }

  // Generic top-up (online payment, subscription-as-topup, etc.)
  if (content.includes("充值")) {
    const m = content.match(CUSTOM_QUOTA_RE) ?? content.match(/充值[^\d]*?([\d.]+)/);
    const value = m ? (m[1] ?? m[2]) : null;
    return {
      label: "Nạp quota",
      quota: value ? Math.round(Number(value)) : null,
      money: null,
    };
  }

  // Subscription
  if (content.includes("订阅") || content.includes("subscription")) {
    return { label: "Nạp từ gói đăng ký", quota: null, money: null };
  }

  return { label: content || "Nạp quota", quota: null, money: null };
}

export default async function VouchersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (isBackendTokenExpiring(session)) {
    redirect("/api/auth/refresh?next=/vouchers");
  }

  let logs: LogEntry[] = [];
  try {
    const result = await getUserLogs({
      accessToken: session.backendAccessToken,
      type: LOG_TYPE_TOPUP,
      size: 100,
    });
    logs = result.data;
  } catch {
    // keep defaults
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[17px] font-bold">Lịch sử nạp</div>
        <VoucherDialog />
      </div>

      {/* Transaction list */}
      {logs.length === 0 ? (
        <div className="rounded-[var(--rs)] border border-[var(--bd)] bg-[var(--surfS)] p-10 text-center">
          <Gift className="mx-auto mb-4 h-12 w-12 text-[var(--mut)]" />
          <p className="text-[var(--mut)]">Chưa có giao dịch nạp nào.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {logs.map((log) => {
            const parsed = parseTopUp(log.content);
            const hasQuota = parsed.quota != null && parsed.quota > 0;
            return (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-[var(--rs)] border border-[var(--bd)] px-4 py-3.5"
              >
                {/* Left: label + date */}
                <div>
                  <code className="text-xs text-[var(--mut)]">
                    {parsed.label}
                  </code>
                  <div className="mt-1 text-xs text-[var(--mut)]">
                    {formatDate(log.created_at)}
                  </div>
                </div>

                {/* Right: quota + detail */}
                <div className="text-right">
                  <div
                    className={`font-semibold font-mono text-sm ${
                      hasQuota ? "text-[var(--ok)]" : "text-[var(--bad)]"
                    }`}
                  >
                    {hasQuota ? `+${formatQuota(parsed.quota!)}` : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
