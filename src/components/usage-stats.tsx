"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatQuota } from "@/lib/quota";
import { cn } from "@/lib/utils";

type Period = "today" | "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hôm nay",
  week: "Tuần",
  month: "Tháng",
  all: "Toàn bộ",
};

function getTimestampRange(period: Period): {
  start?: number;
  end?: number;
} {
  if (period === "all") return {};
  const now = new Date();
  let start: Date;
  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week": {
      const day = now.getDay() || 7; // Mon = 1
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      break;
    }
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  return { start: Math.floor(start.getTime() / 1000) };
}

interface UsageStatsProps {
  /** All-time values from getSelf, used as initial "all" data */
  initialUsedQuota?: number;
  initialRequestCount?: number;
  group?: string;
}

export function UsageStats({
  initialUsedQuota,
  initialRequestCount,
  group,
}: UsageStatsProps) {
  const [period, setPeriod] = useState<Period>("all");
  const [usedQuota, setUsedQuota] = useState(initialUsedQuota);
  const [requestCount, setRequestCount] = useState(initialRequestCount);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (p: Period) => {
    if (p === "all") {
      setUsedQuota(initialUsedQuota);
      setRequestCount(initialRequestCount);
      return;
    }
    setLoading(true);
    try {
      const range = getTimestampRange(p);
      const params = new URLSearchParams();
      if (range.start != null) params.set("start", String(range.start));
      if (range.end != null) params.set("end", String(range.end));
      const res = await fetch(`/api/portal/stats?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsedQuota(json.data.usedQuota);
        setRequestCount(json.data.requestCount);
      }
    } catch {
      // keep previous values
    } finally {
      setLoading(false);
    }
  }, [initialUsedQuota, initialRequestCount]);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Period filter */}
      <div className="flex gap-1.5">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              period === p
                ? "bg-[var(--acc)] text-white"
                : "border border-[var(--bd)] text-[var(--mut)] hover:text-[var(--tx)]",
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Card className={cn("bg-[var(--surf2)] shadow-none", loading && "opacity-60 transition-opacity")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-[var(--mut)]">Đã sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[30px] leading-none font-bold tracking-[-0.02em]">{usedQuota === undefined ? "—" : formatQuota(usedQuota)}</p>
            <p className="mt-2 font-mono text-[12.5px] text-[var(--mut)]">mzđ</p>
          </CardContent>
        </Card>

        <Card className={cn("bg-[var(--surf2)] shadow-none", loading && "opacity-60 transition-opacity")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-[var(--mut)]">Tổng request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[30px] leading-none font-bold tracking-[-0.02em]">{requestCount === undefined ? "—" : requestCount.toLocaleString()}</p>
            <p className="mt-2 text-[12.5px] text-[var(--mut)]">lượt gọi API · nhóm <Badge variant="secondary">{group || "default"}</Badge></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
