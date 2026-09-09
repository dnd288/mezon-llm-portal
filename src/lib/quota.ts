/**
 * Quota display helpers.
 * In new-api, 1 quota = $0.002 (500 quota = $1).
 */

export function formatQuota(quota: number): string {
  if (quota >= 1_000_000) return `${(quota / 1_000_000).toFixed(2)}M`;
  if (quota >= 1_000) return `${(quota / 1_000).toFixed(1)}K`;
  return quota.toLocaleString();
}

export function quotaToDollars(quota: number): string {
  return `$${(quota / 500_000).toFixed(4)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toLocaleString();
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}
