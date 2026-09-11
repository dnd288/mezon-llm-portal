import { getSession } from "@/lib/auth";
import { getUserLogs, type LogEntry } from "@/lib/api";
import { formatDate, formatQuota } from "@/lib/quota";
import { Gift } from "lucide-react";
import { redirect } from "next/navigation";
import { VoucherDialog } from "@/components/voucher-dialog";

/** LogTypeTopup = 1 in the backend */
const LOG_TYPE_TOPUP = 1;

interface ParsedTopUp {
  label: string;
  quota: number | null;
  money: string | null;
}

/**
 * Parse backend log content into a structured top-up record.
 */
function parseTopUp(content: string): ParsedTopUp {
  // Voucher redeem: "通过兑换码充值 500000.000000 mzđ 额度，兑换码ID 97"
  if (content.includes("兑换码")) {
    const m = content.match(/充值\s+([\d.]+)\s*mzđ/i);
    return {
      label: "Nạp bằng voucher",
      quota: m ? Math.round(Number(m[1])) : null,
      money: null,
    };
  }

  // Mezon on-chain: "Mezon top-up successful: transferred 1000000 dong, credited 1000000 mzđ (1:1), tx ..."
  if (content.includes("Mezon top-up")) {
    const qm = content.match(/credited\s+([\d.]+)\s*mzđ/i);
    const dm = content.match(/transferred\s+([\d.]+)\s*dong/i);
    return {
      label: "Nạp qua Mezon",
      quota: qm ? Math.round(Number(qm[1])) : null,
      money: dm ? `${Number(dm[1]).toLocaleString("vi-VN")}đ` : null,
    };
  }

  // Waffo Pancake: "Waffo Pancake充值成功，充值额度: %v，支付金额: %.2f"
  if (content.includes("Waffo") || content.includes("Pancake")) {
    const qm = content.match(/充值额度:\s*([\d.]+)/);
    const dm = content.match(/支付金额:\s*([\d.]+)/);
    return {
      label: "Nạp qua Waffo Pancake",
      quota: qm ? Math.round(Number(qm[1])) : null,
      money: dm ? `${Number(dm[1]).toLocaleString("vi-VN")}đ` : null,
    };
  }

  // Generic top-up
  if (content.includes("充值")) {
    const m = content.match(/充值\s*([\d.]+)/);
    return {
      label: "Nạp quota",
      quota: m ? Math.round(Number(m[1])) : null,
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
