import { getSession } from "@/lib/auth";
import {
  getModelStatus,
  getPerformanceMetrics,
  getPricing,
  type ModelStatus,
  type PerformanceMetric,
} from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { ModelPricingGrid, type ModelPricingItem } from "@/components/model-pricing-grid";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng giá Model",
};

const PROVIDERS: Record<
  number,
  { name: string; logoSrc: string; logoClassName?: string }
> = {
  1: { name: "MiniMax", logoSrc: "/minimax-color.png" },
  2: { name: "Kimi", logoSrc: "/kimi-logo-png-svg.webp" },
  3: { name: "DeepSeek", logoSrc: "/DeepSeek-icon.svg.webp" },
  4: { name: "OpenAI", logoSrc: "/openai.png" },
  5: { name: "Google Gemini", logoSrc: "/Google_Gemini_icon_2025.svg.webp" },
  6: { name: "Zhipu AI", logoSrc: "/zhipu-color.png", logoClassName: "bg-white p-1.5" },
  7: { name: "xAI", logoSrc: "/xai-logo-png_seeklogo-491313.png", logoClassName: "bg-white p-1.5" },
  8: { name: "Anthropic", logoSrc: "/anthropic.png" },
};

const UNKNOWN_PROVIDER: { name: string; logoSrc: undefined; logoClassName?: string } = {
  name: "Khác",
  logoSrc: undefined,
};

function providerFor(model: {
  owner_by: string;
  vendor_id: number;
}): { name: string; logoSrc?: string; logoClassName?: string } {
  const owner = model.owner_by.trim();
  return owner
    ? { name: owner }
    : (PROVIDERS[model.vendor_id] ?? UNKNOWN_PROVIDER);
}

const QUOTA_PER_MILLION_TOKENS = 500_000;

function mzndPerMillionTokens(model: {
  quota_type: number;
  model_ratio: number;
  model_price: number;
}): string {
  const quota =
    model.quota_type === 1
      ? model.model_price * QUOTA_PER_MILLION_TOKENS
      : model.model_ratio * QUOTA_PER_MILLION_TOKENS;

  if (!Number.isFinite(quota) || quota <= 0) return "—";
  if (quota >= 1_000_000) return `${(quota / 1_000_000).toFixed(2)}M`;
  if (quota >= 1_000) return `${(quota / 1_000).toFixed(1)}K`;
  return quota.toLocaleString("vi-VN");
}

export default async function ModelsPage() {
  const [pricing, session, statuses, metrics] = await Promise.all([
    getPricing(),
    getSession(),
    getModelStatus().catch(() => [] as ModelStatus[]),
    getPerformanceMetrics().catch(() => [] as PerformanceMetric[]),
  ]);
  const metricsByModel = metrics.reduce<Record<string, PerformanceMetric>>(
    (result, metric) => {
      result[metric.model_name] = metric;
      return result;
    },
    {},
  );

  const statusByModel = statuses.reduce<Record<string, ModelStatus>>(
    (result, status) => {
      result[status.name] = status;
      return result;
    },
    {},
  );
  const items: ModelPricingItem[] = pricing
    .map((model) => {
      const status = statusByModel[model.model_name];
      const metric = metricsByModel[model.model_name];
      const provider = providerFor(model);
      const successRate = metric?.success_rate ?? status?.success_rate ?? null;
      const alive = status?.probe.alive ?? true;
      // Health from live traffic: ≥90% success = stable, ≥50% =
      // degraded, below that (or a failed probe) = error. No traffic
      // yet means the probe result alone decides.
      const health: ModelPricingItem["status"] =
        successRate === null
          ? (alive ? undefined : "error")
          : successRate >= 90
            ? "stable"
            : successRate >= 50
              ? "degraded"
              : "error";
      return {
        name: model.model_name,
        provider: provider.name,
        providerLogoClassName: provider.logoClassName,
        providerLogoSrc: provider.logoSrc,
        inputPrice: mzndPerMillionTokens(model),
        priceUnit:
          (model.quota_type === 1
            ? "per-request"
            : "per-million-tokens") as ModelPricingItem["priceUnit"],
        outputPrice:
          model.quota_type === 1
            ? "—"
            : mzndPerMillionTokens({
                ...model,
                model_ratio: model.model_ratio * model.completion_ratio,
              }),
        available: true,
        groups: model.enable_groups?.length ? model.enable_groups : ["default"],
        status: health,
        latency: metric?.avg_latency_ms
          ? metric.avg_latency_ms / 1000
          : status?.avg_latency_ms
            ? status.avg_latency_ms / 1000
            : status?.probe.latency_ms
              ? status.probe.latency_ms / 1000
              : undefined,
        tokensPerSecond: metric?.avg_tps,
        uptimeSeries: metric?.recent_success_series?.map((point) => ({
          ts: point.ts,
          successRate: point.success_rate,
        })),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--bd)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/mezon-logo-icon.svg"
              alt="Mezon LLM"
              width={30}
              height={30}
              className="h-[30px] w-[30px]"
            />
            <div className="flex flex-col">
              <span className="text-[15px] leading-none font-extrabold tracking-tight">
                MEZON LLM
              </span>
              <span className="mt-0.5 text-[8.5px] leading-none font-semibold tracking-[0.3em] text-[var(--acc)]">
                API GATEWAY
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/models"
              className="text-[13px] text-[var(--mut)] transition-colors hover:text-[var(--tx)]"
            >
              Bảng giá
            </Link>
            <Link
              href={session ? "/dashboard" : "/login"}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {session ? "Dashboard" : "Đăng nhập"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1 className="text-[26px] font-bold tracking-[-0.02em]">
          Bảng giá mô hình
        </h1>
        <p className="mt-1.5 text-[13.5px] text-[var(--mut)]">
          Giá cho 1 triệu token, tính bằng mzđ (Mezon Đồng).
        </p>
        <div className="mt-6">
          <ModelPricingGrid models={items} />
        </div>
      </main>

      <footer className="border-t border-[var(--bd)] px-4 py-[18px]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3.5 text-[12.5px] text-[var(--mut)]">
          <span>© 2026 Mezon LLM — thành viên hệ sinh thái Mezon.</span>
          <Link
            href="/"
            className="text-[var(--acc)] transition-colors hover:text-[var(--g1)]"
          >
            ← Về trang chủ
          </Link>
        </div>
      </footer>
    </div>
  );
}
