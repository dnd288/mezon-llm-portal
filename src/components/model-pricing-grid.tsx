"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface ModelPricingItem {
  name: string;
  provider: string;
  providerLogoSrc?: string;
  providerLogoClassName?: string;
  inputPrice: string;
  outputPrice: string;
  priceUnit: "per-million-tokens" | "per-request";
  available: boolean;
  groups: string[];
  /** Live-traffic health derived by the server page. */
  status?: "stable" | "degraded" | "error";
  /** Average latency in seconds, when the gateway reported one. */
  latency?: number;
  /** Average output tokens per second during the latest 24-hour window. */
  tokensPerSecond?: number;
  /** One success-rate sample per measured hourly bucket in the trailing 24 hours. */
  uptimeSeries?: Array<{ ts: number; successRate: number }>;
}

type HealthPresentation = {
  label: string;
  variant: "active" | "expired" | "revoked";
};

/**
 * Design vocabulary: Ổn định (stable) / Chập chờn (degraded) /
 * Lỗi (error), with a text label always alongside the color.
 */
const HEALTH_PRESENTATION: Record<
  NonNullable<ModelPricingItem["status"]>,
  HealthPresentation
> = {
  stable: { label: "Ổn định", variant: "active" },
  degraded: { label: "Chập chờn", variant: "expired" },
  error: { label: "Lỗi", variant: "revoked" },
};

type HealthFilter = "all" | "stable" | "degraded" | "error";

const HEALTH_FILTERS: Array<{ value: HealthFilter; label: string; dotClassName?: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "stable", label: "Ổn định", dotClassName: "bg-[var(--ok)]" },
  { value: "degraded", label: "Chập chờn", dotClassName: "bg-[var(--warn)]" },
  { value: "error", label: "Lỗi", dotClassName: "bg-[var(--bad)]" },
];

function groupBadgeClassName(group: string): string {
  return group.toLowerCase() === "vip"
    ? "border-warn-tint bg-warn-tint text-[var(--warn)]"
    : "border-[color-mix(in_oklab,var(--g2)_32%,transparent)] bg-[color-mix(in_oklab,var(--g2)_14%,transparent)] text-[var(--acc)]";
}

function uptimeColor(successRate: number): string {
  if (successRate >= 90) return "bg-[var(--ok)]";
  if (successRate >= 50) return "bg-[var(--warn)]";
  return "bg-[var(--bad)]";
}

function UptimeTimeline({ series }: { series: ModelPricingItem["uptimeSeries"] }) {
  const points: Record<string, number> = {};
  for (const point of series ?? []) {
    points[Math.floor(point.ts / 3600)] = point.successRate;
  }
  const currentHour = Math.floor(Date.now() / 3_600_000);
  const hours = Array.from({ length: 24 }, (_, index) => currentHour - 23 + index);
  const average = series?.length
    ? series.reduce((total, point) => total + point.successRate, 0) / series.length
    : undefined;

  return (
    <div className="min-w-[150px] flex-1">
      <div className="flex justify-between text-[11.5px] font-semibold text-[var(--mut)]">
        <span>Uptime 24h</span>
        <span className="text-[var(--tx)]">{average === undefined ? "—" : `${average.toFixed(1)}%`}</span>
      </div>
      <div className="mt-1.5 flex h-3 gap-[3px]" aria-label={average === undefined ? "Uptime 24 giờ: không có dữ liệu" : `Uptime 24 giờ: ${average.toFixed(1)}%`}>
        {hours.map((hour) => {
          const successRate = points[hour];
          return (
            <span
              key={hour}
              title={successRate === undefined ? "Không có request" : `${successRate.toFixed(1)}% thành công`}
              className={`flex-1 rounded-[2px] ${successRate === undefined ? "bg-[var(--bd)]" : uptimeColor(successRate)}`}
            />
          );
        })}
      </div>
    </div>
  );
}


export function ModelPricingGrid({ models }: { models: ModelPricingItem[] }) {
  const [query, setQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = models.filter((model) => {
      const matchesQuery = `${model.name} ${model.provider}`
        .toLowerCase()
        .includes(normalizedQuery);
      return (
        matchesQuery &&
        (providerFilter === "all" || model.provider === providerFilter) &&
        (healthFilter === "all" || model.status === healthFilter)
      );
    });

    return visible.reduce<Record<string, ModelPricingItem[]>>(
      (result, model) => {
        (result[model.provider] ??= []).push(model);
        return result;
      },
      {},
    );
  }, [healthFilter, models, providerFilter, query]);

  async function copyModelId(name: string) {
    await navigator.clipboard?.writeText(name);
    setCopied(name);
    window.setTimeout(
      () => setCopied((current) => (current === name ? null : current)),
      1600,
    );
  }

  return (
    <div>
      <label className="relative mb-6 block max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--mut)]" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm model…"
          className="h-11 rounded-full pr-4 pl-10"
        />
      </label>
      <div className="mb-5 space-y-2.5">
        <div className="flex flex-wrap gap-2">
          {[["all", "Tất cả", models.length] as const, ...Object.entries(models.reduce<Record<string, number>>((counts, model) => {
            counts[model.provider] = (counts[model.provider] ?? 0) + 1;
            return counts;
          }, {})).sort(([left], [right]) => left.localeCompare(right))].map(([provider, labelOrCount, count]) => {
            const label = provider === "all" ? labelOrCount : provider;
            const total = provider === "all" ? count : labelOrCount;
            return (
              <button
                key={provider}
                type="button"
                onClick={() => setProviderFilter(provider)}
                className={providerFilter === provider ? "rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-semibold text-white" : "rounded-full border border-[var(--bd)] px-3.5 py-1.5 text-xs font-medium text-[var(--mut)] hover:border-[var(--bdS)] hover:text-[var(--tx)]"}
              >
                {label} · {total}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] font-semibold tracking-[0.1em] text-[var(--mut)] uppercase">Sức khoẻ</span>
          {HEALTH_FILTERS.map((filter) => {
            const count = filter.value === "all" ? models.length : models.filter((model) => model.status === filter.value).length;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setHealthFilter(filter.value)}
                className={healthFilter === filter.value ? "rounded-full border border-[var(--bdS)] bg-[var(--surf)] px-3 py-1.5 text-xs font-semibold text-[var(--tx)]" : "rounded-full border border-[var(--bd)] px-3 py-1.5 text-xs font-medium text-[var(--mut)] hover:border-[var(--bdS)] hover:text-[var(--tx)]"}
              >
                {filter.dotClassName && <span className={`mr-1.5 inline-block size-[7px] rounded-full ${filter.dotClassName}`} />}
                {filter.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="rounded-[var(--r)] border border-dashed border-[var(--bdS)] px-6 py-14 text-center text-[var(--mut)]">
          Không tìm thấy model phù hợp.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groups)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([provider, providerModels]) => (
              <section key={provider}>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-[17px] font-semibold">{provider}</h2>
                  <Badge variant="secondary">{providerModels.length}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {providerModels.map((model) => {
                    const health = model.status && HEALTH_PRESENTATION[model.status];
                    return (
                      <Card
                        key={model.name}
                        className="transition-colors hover:border-[var(--bdS)]"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3.5">
                            {model.providerLogoSrc ? (
                              <img
                                src={model.providerLogoSrc}
                                alt={`${model.provider} logo`}
                                className={`size-11 shrink-0 rounded-lg object-contain ${model.providerLogoClassName ?? ""}`}
                              />
                            ) : (
                              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--surf2)] font-mono text-[17px] font-bold text-[var(--acc)]">
                                {model.provider.trim().slice(0, 1).toUpperCase() || "M"}
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="break-all font-mono text-[15.5px] font-semibold tracking-[-0.01em]">
                                  {model.name}
                                </h3>
                                {health && (
                                  <Badge variant={health.variant}>
                                    {health.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-[12.5px] text-[var(--mut)]">
                                {model.provider}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => void copyModelId(model.name)}
                              aria-label={`Sao chép ${model.name}`}
                            >
                              {copied === model.name ? (
                                <Check className="size-4 text-[var(--ok)]" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </Button>
                          </div>

                          {model.priceUnit === "per-request" ? (
                            <div className="mt-5">
                              <p className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[var(--mut)]">
                                Giá
                              </p>
                              <p className="mt-1.5 font-mono text-[17px] font-bold">
                                {model.inputPrice}{" "}
                                <span className="text-[12.5px] font-normal text-[var(--mut)]">
                                  mzđ / request
                                </span>
                              </p>
                            </div>
                          ) : (
                            <div className="mt-5 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[var(--mut)]">
                                  Input
                                </p>
                                <p className="mt-1.5 font-mono text-[17px] font-bold">
                                  {model.inputPrice}{" "}
                                  <span className="text-[12.5px] font-normal text-[var(--mut)]">
                                    mzđ / 1M
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[var(--mut)]">
                                  Output
                                </p>
                                <p className="mt-1.5 font-mono text-[17px] font-bold">
                                  {model.outputPrice}{" "}
                                  <span className="text-[12.5px] font-normal text-[var(--mut)]">
                                    mzđ / 1M
                                  </span>
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[12.5px]">
                            <span className="mr-1 text-[var(--mut)]">Nhóm</span>
                            {model.groups.map((group) => (
                              <Badge
                                key={group}
                                variant="secondary"
                                className={groupBadgeClassName(group)}
                              >
                                {group}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-4 flex flex-wrap items-end gap-x-[18px] gap-y-3 border-t border-[var(--bd)] pt-3.5 text-[12.5px]">
                            <UptimeTimeline series={model.uptimeSeries} />
                            <div>
                              <p className="text-[11.5px] font-semibold text-[var(--mut)]">Lat.</p>
                              <p className="mt-1 font-mono text-sm font-semibold">
                                {model.latency === undefined ? "—" : `${model.latency.toFixed(2)}s`}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11.5px] font-semibold text-[var(--mut)]">TPS</p>
                              <p className="mt-1 font-mono text-sm font-semibold">
                                {model.tokensPerSecond === undefined ? "—" : model.tokensPerSecond.toFixed(1)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
