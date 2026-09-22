import type { PricingModel } from "./api";

/**
 * Conversion rate: in new-api / Mezon LLM, 1 USD = 500,000 quota (mzđ).
 */
export const QUOTA_PER_USD = 500_000;

export type ParsedTierPricing =
  | { type: "request"; price: number }
  | { type: "token"; p: number | null; c: number | null };

export interface ModelPriceResolution {
  inputPrice: string;
  outputPrice: string;
  priceUnit: "per-million-tokens" | "per-request";
}

/**
 * Extracts the primary tier body from expressions like:
 * - tier("base", p * 0.08 + c * 0.4)
 * - len <= 272000 ? tier("standard", p * 10 + c * 50) : ...
 * - tier("request", fixed(0.01))
 * - p * 0.08 + c * 0.4
 *
 * Handles nested parentheses (such as fixed(...)) inside tier(...).
 */
export function extractTierBody(expr: string): string {
  const trimmed = expr.trim();
  const startIdx = trimmed.indexOf("tier(");
  if (startIdx === -1) return trimmed;

  const commaIdx = trimmed.indexOf(",", startIdx);
  if (commaIdx === -1) return trimmed;

  let depth = 1;
  const bodyStart = commaIdx + 1;
  let i = startIdx + 5;
  let tierClose = -1;

  for (; i < trimmed.length; i++) {
    if (trimmed[i] === "(") {
      depth++;
    } else if (trimmed[i] === ")") {
      depth--;
      if (depth === 0) {
        tierClose = i;
        break;
      }
    }
  }

  if (tierClose !== -1) {
    return trimmed.slice(bodyStart, tierClose).trim();
  }

  return trimmed;
}

/**
 * Parses a billing expression to extract prompt rate (p), completion rate (c),
 * or fixed per-request rate.
 *
 * In new-api tiered billing, expression coefficients for token models are in
 * USD per 1,000,000 tokens ($/1M), and fixed rates are in USD per request.
 */
export function parseTierExpr(expr: string): ParsedTierPricing | null {
  if (!expr || !expr.trim()) return null;
  const target = extractTierBody(expr);

  const fixedMatch = target.match(/\bfixed\s*\(\s*([\d.eE+-]+)\s*\)/);
  if (fixedMatch) {
    const price = Number.parseFloat(fixedMatch[1]);
    if (Number.isFinite(price)) {
      return { type: "request", price };
    }
  }

  const pMatch = target.match(
    /(?:\bp\b\s*\*\s*([\d.eE+-]+)|([\d.eE+-]+)\s*\*\s*\bp\b)/,
  );
  const cMatch = target.match(
    /(?:\bc\b\s*\*\s*([\d.eE+-]+)|([\d.eE+-]+)\s*\*\s*\bc\b)/,
  );

  const pRaw = pMatch ? (pMatch[1] ?? pMatch[2]) : null;
  const cRaw = cMatch ? (cMatch[1] ?? cMatch[2]) : null;

  const p = pRaw !== null ? Number.parseFloat(pRaw) : null;
  const c = cRaw !== null ? Number.parseFloat(cRaw) : null;

  const validP = p !== null && Number.isFinite(p) ? p : null;
  const validC = c !== null && Number.isFinite(c) ? c : null;

  if (validP === null && validC === null) return null;
  return { type: "token", p: validP, c: validC };
}

/**
 * Formats an amount in mzđ (Mezon Đồng) for card display.
 * e.g.:
 * - 40,000 -> 40.0K
 * - 200,000 -> 200.0K
 * - 1,250,000 -> 1.25M
 * - 20 -> 20
 * - <= 0 or invalid -> —
 */
export function formatMznd(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return "—";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString("vi-VN");
}

/**
 * Resolves the display prices and price unit for a model.
 * Prioritizes tiered expression billing (`billing_expr`) when present,
 * and falls back cleanly to legacy `quota_type: 1` (per request) and
 * `quota_type: 0` (token ratio).
 */
export function resolveModelPricing(
  model: Pick<
    PricingModel,
    "quota_type" | "model_ratio" | "model_price" | "completion_ratio" | "billing_expr"
  >,
): ModelPriceResolution {
  if (model.billing_expr) {
    const parsed = parseTierExpr(model.billing_expr);
    if (parsed) {
      if (parsed.type === "request") {
        return {
          priceUnit: "per-request",
          inputPrice: formatMznd(parsed.price * QUOTA_PER_USD),
          outputPrice: "—",
        };
      }
      return {
        priceUnit: "per-million-tokens",
        inputPrice: parsed.p !== null ? formatMznd(parsed.p * QUOTA_PER_USD) : "—",
        outputPrice: parsed.c !== null ? formatMznd(parsed.c * QUOTA_PER_USD) : "—",
      };
    }
  }

  if (model.quota_type === 1) {
    return {
      priceUnit: "per-request",
      inputPrice: formatMznd(model.model_price * QUOTA_PER_USD),
      outputPrice: "—",
    };
  }

  return {
    priceUnit: "per-million-tokens",
    inputPrice: formatMznd(model.model_ratio * QUOTA_PER_USD),
    outputPrice: formatMznd(
      model.model_ratio * model.completion_ratio * QUOTA_PER_USD,
    ),
  };
}
