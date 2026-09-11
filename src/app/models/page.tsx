import { getPricing } from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Search, Zap } from "lucide-react";

const QUOTA_PER_MILLION_TOKENS = 500_000;

function quotaPerMillionTokens(ratio: number): string {
  if (!ratio || ratio <= 0) return "—";
  const quota = ratio * QUOTA_PER_MILLION_TOKENS;
  if (quota >= 1_000_000) return `${(quota / 1_000_000).toFixed(2)}M`;
  if (quota >= 1_000) return `${(quota / 1_000).toFixed(1)}K`;
  return quota.toLocaleString();
}

function dollarsPerMillionTokens(ratio: number): string {
  if (!ratio || ratio <= 0) return "—";
  const quota = ratio * QUOTA_PER_MILLION_TOKENS;
  const dollars = quota / 500_000;
  return `$${dollars.toFixed(2)}`;
}

export default async function ModelsPage() {
  const [pricing, session] = await Promise.all([getPricing(), getSession()]);

  // Group models by owned_by
  const grouped: Record<string, typeof pricing> = {};
  for (const model of pricing) {
    const provider = model.owned_by || "Khác";
    if (!grouped[provider]) {
      grouped[provider] = [];
    }
    grouped[provider].push(model);
  }

  // Sort providers alphabetically
  const sortedProviders = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--bd)]">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Mezon LLM</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/models"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-[var(--mut)] hover:text-[var(--tx)]",
              )}
            >
              Mô hình
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--mut)] hover:text-[var(--tx)] mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Bảng giá mô hình
          </h1>
          <p className="text-[var(--mut)] mt-2">
            Khám phá các mô hình AI và mức giá tương ứng. Giá tính theo quota
            cho 1 triệu token.
          </p>
        </div>

        {/* Search - client-side filtering would need a client component,
            but for a server component we render a static input that
            can be enhanced later. We use URL search params for filtering. */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--mut)]" />
          <Input
            type="search"
            placeholder="Tìm kiếm mô hình..."
            className="pl-8"
            name="q"
            // In a real app, wrap in a <form> for server-side filtering
          />
        </div>

        {/* Pricing grid grouped by provider */}
        <div className="space-y-10">
          {sortedProviders.map((provider) => {
            const models = grouped[provider];
            // Sort models by name
            models.sort((a, b) => a.model_name.localeCompare(b.model_name));

            return (
              <section key={provider}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-[var(--mut)]">{provider}</span>
                  <Badge variant="secondary">{models.length}</Badge>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {models.map((model) => {
                    const inputPrice = quotaPerMillionTokens(
                      model.model_ratio,
                    );
                    const outputPrice = quotaPerMillionTokens(
                      model.model_ratio * model.completion_ratio,
                    );
                    const inputDollars = dollarsPerMillionTokens(
                      model.model_ratio,
                    );
                    const outputDollars = dollarsPerMillionTokens(
                      model.model_ratio * model.completion_ratio,
                    );

                    return (
                      <Card
                        key={model.model_name}
                        className={cn(
                          "transition-shadow hover:shadow-md",
                          !model.available && "opacity-60",
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base truncate">
                                {model.model_name}
                              </CardTitle>
                              <CardDescription className="truncate">
                                {model.owned_by}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                model.available ? "active" : "revoked"
                              }
                            >
                              {model.available ? "Sẵn sàng" : "Không khả dụng"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[var(--mut)]">
                                Input (1M tokens)
                              </span>
                              <span className="font-medium">
                                {inputPrice} quota
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--mut)]">
                                Output (1M tokens)
                              </span>
                              <span className="font-medium">
                                {outputPrice} quota
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                              <span className="text-[var(--mut)]">
                                ~ Input
                              </span>
                              <span className="text-[var(--mut)]">
                                {inputDollars}/M
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--mut)]">
                                ~ Output
                              </span>
                              <span className="text-[var(--mut)]">
                                {outputDollars}/M
                              </span>
                            </div>
                          </div>
                          {model.tags && model.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {model.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--bd)] py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-[var(--mut)]">
          <p>Mezon LLM — Nền tảng AI API cho cộng đồng</p>
        </div>
      </footer>
    </div>
  );
}
