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
  group: string;
  /** Live-traffic health derived by the server page. */
  status?: "stable" | "degraded" | "error";
  /** Average latency in seconds, when the gateway reported one. */
  latency?: number;
  /** Average output tokens per second during the latest 24-hour window. */
  tokensPerSecond?: number;
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

export function ModelPricingGrid({ models }: { models: ModelPricingItem[] }) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = normalizedQuery
      ? models.filter((model) =>
          `${model.name} ${model.provider}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : models;

    return visible.reduce<Record<string, ModelPricingItem[]>>(
      (result, model) => {
        (result[model.provider] ??= []).push(model);
        return result;
      },
      {},
    );
  }, [models, query]);

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
                <div className="grid gap-4 lg:grid-cols-2">
                  {providerModels.map((model) => {
                    const health = model.available
                      ? (model.status && HEALTH_PRESENTATION[model.status])
                      : { label: "Không khả dụng", variant: "revoked" as const };
                    return (
                      <Card
                        key={model.name}
                        className={
                          !model.available
                            ? "opacity-65"
                            : "transition-colors hover:border-[var(--bdS)]"
                        }
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3.5">
                            {model.providerLogoSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={model.providerLogoSrc}
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

                          <div className="mt-5 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[var(--mut)]">
                                {model.priceUnit === "per-request" ? "Mỗi yêu cầu" : "Input"}
                              </p>
                              <p className="mt-1.5 font-mono text-[17px] font-bold">
                                {model.inputPrice}{" "}
                                <span className="text-[12.5px] font-normal text-[var(--mut)]">
                                  mzđ {model.priceUnit === "per-request" ? "/ request" : "/ 1M"}
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
                                  {model.priceUnit === "per-request" ? "Không áp dụng" : "mzđ / 1M"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--bd)] pt-3.5 text-[12.5px]">
                            <span>
                              <span className="text-[var(--mut)]">Nhóm </span>
                              <span className="font-semibold">{model.group}</span>
                            </span>
                            <div className="flex items-center gap-3 text-[var(--mut)]">
                              <span>
                                {model.tokensPerSecond === undefined
                                  ? "— tok/s"
                                  : `${model.tokensPerSecond.toFixed(1)} tok/s`}
                              </span>
                              <span>
                                {model.latency === undefined
                                  ? "— độ trễ"
                                  : `${model.latency.toFixed(2)}s`}
                              </span>
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
