import { describe, expect, it } from "vitest";
import {
  extractTierBody,
  formatMznd,
  parseTierExpr,
  resolveModelPricing,
} from "./pricing";

describe("extractTierBody", () => {
  it("extracts body from a simple tier call", () => {
    expect(extractTierBody('tier("base", p * 0.08 + c * 0.4)')).toBe(
      "p * 0.08 + c * 0.4",
    );
  });

  it("extracts body when nested parentheses are present like fixed()", () => {
    expect(extractTierBody('tier("request", fixed(0.01))')).toBe("fixed(0.01)");
  });

  it("extracts the first tier body from conditional tiered expressions", () => {
    const expr =
      'len <= 272000 ? tier("standard", p * 10 + c * 50 + cr * 1 + cc * 12.5) : tier("long_context", p * 20 + c * 75)';
    expect(extractTierBody(expr)).toBe(
      "p * 10 + c * 50 + cr * 1 + cc * 12.5",
    );
  });

  it("returns trimmed expression if tier() is not found", () => {
    expect(extractTierBody("  p * 0.08 + c * 0.4  ")).toBe("p * 0.08 + c * 0.4");
  });
});

describe("parseTierExpr", () => {
  it("parses gpt-6-astra base tier expression", () => {
    const result = parseTierExpr('tier("base", p * 0.08 + c * 0.4)');
    expect(result).toEqual({
      type: "token",
      p: 0.08,
      c: 0.4,
    });
  });

  it("parses claude-fable-5-1 base tier expression", () => {
    const result = parseTierExpr('tier("base", p * 0.04 + c * 0.2)');
    expect(result).toEqual({
      type: "token",
      p: 0.04,
      c: 0.2,
    });
  });

  it("parses fixed price expression", () => {
    const result = parseTierExpr('tier("request", fixed(0.01))');
    expect(result).toEqual({
      type: "request",
      price: 0.01,
    });
  });

  it("parses expression with reversed operands (num * var)", () => {
    const result = parseTierExpr("0.08 * p + 0.4 * c");
    expect(result).toEqual({
      type: "token",
      p: 0.08,
      c: 0.4,
    });
  });

  it("ignores other variables like cache read (cr) and cache create (cc)", () => {
    const result = parseTierExpr(
      'tier("standard", p * 10 + c * 50 + cr * 1 + cc * 12.5)',
    );
    expect(result).toEqual({
      type: "token",
      p: 10,
      c: 50,
    });
  });

  it("handles free/zero expression", () => {
    const result = parseTierExpr('tier("free", p * 0 + c * 0)');
    expect(result).toEqual({
      type: "token",
      p: 0,
      c: 0,
    });
  });

  it("returns null for empty or unparseable expressions", () => {
    expect(parseTierExpr("")).toBeNull();
    expect(parseTierExpr("unknown_function()")).toBeNull();
  });
});

describe("formatMznd", () => {
  it("formats large numbers with commas", () => {
    expect(formatMznd(1_250_000)).toBe("1,250,000");
    expect(formatMznd(200_000)).toBe("200,000");
    expect(formatMznd(40_000)).toBe("40,000");
    expect(formatMznd(22_500)).toBe("22,500");
    expect(formatMznd(4_500)).toBe("4,500");
    expect(formatMznd(2_000)).toBe("2,000");
    expect(formatMznd(1_000)).toBe("1,000");
  });

  it("formats small numbers with locale string", () => {
    expect(formatMznd(20)).toBe("20");
    expect(formatMznd(375)).toBe("375");
    expect(formatMznd(750)).toBe("750");
  });

  it("returns dash for non-positive or non-finite numbers", () => {
    expect(formatMznd(0)).toBe("—");
    expect(formatMznd(-10)).toBe("—");
    expect(formatMznd(null)).toBe("—");
    expect(formatMznd(undefined)).toBe("—");
    expect(formatMznd(Number.NaN)).toBe("—");
  });
});

describe("resolveModelPricing", () => {
  it("resolves gpt-6-astra accurately from billing_expr instead of legacy ratio", () => {
    const model = {
      quota_type: 0,
      model_ratio: 0.04,
      model_price: 0,
      completion_ratio: 5,
      billing_expr: 'tier("base", p * 0.08 + c * 0.4)',
    };

    const resolution = resolveModelPricing(model);
    expect(resolution).toEqual({
      priceUnit: "per-million-tokens",
      inputPrice: "40,000",
      outputPrice: "200,000",
    });
  });

  it("resolves claude-fable-5-1 accurately from billing_expr overriding stale ratio", () => {
    const model = {
      quota_type: 0,
      model_ratio: 37.5,
      model_price: 0,
      completion_ratio: 1,
      billing_expr: 'tier("base", p * 0.04 + c * 0.2)',
    };

    const resolution = resolveModelPricing(model);
    expect(resolution).toEqual({
      priceUnit: "per-million-tokens",
      inputPrice: "20,000",
      outputPrice: "100,000",
    });
  });

  it("resolves claude-opus-4-8 from billing_expr accurately", () => {
    const model = {
      quota_type: 0,
      model_ratio: 0.005,
      model_price: 0,
      completion_ratio: 5,
      billing_mode: "tiered_expr",
      billing_expr: 'tier("base", p * 0.009 + c * 0.045)',
    };

    const resolution = resolveModelPricing(model);
    expect(resolution).toEqual({
      priceUnit: "per-million-tokens",
      inputPrice: "4,500",
      outputPrice: "22,500",
    });
  });

  it("resolves fixed price expression as per-request", () => {
    const model = {
      quota_type: 0,
      model_ratio: 0,
      model_price: 0,
      completion_ratio: 1,
      billing_expr: 'tier("request", fixed(0.01))',
    };

    const resolution = resolveModelPricing(model);
    expect(resolution).toEqual({
      priceUnit: "per-request",
      inputPrice: "5,000",
      outputPrice: "—",
    });
  });

  it("resolves legacy per-request models (quota_type === 1)", () => {
    const model = {
      quota_type: 1,
      model_ratio: 0,
      model_price: 0.00004,
      completion_ratio: 0,
    };

    const resolution = resolveModelPricing(model);
    expect(resolution).toEqual({
      priceUnit: "per-request",
      inputPrice: "20",
      outputPrice: "—",
    });
  });

  it("resolves standard token ratio models accurately (claude-sonnet-5)", () => {
    const model = {
      quota_type: 0,
      model_ratio: 0.002,
      model_price: 0,
      completion_ratio: 5,
    };

    const resolution = resolveModelPricing(model);
    expect(resolution).toEqual({
      priceUnit: "per-million-tokens",
      inputPrice: "2,000",
      outputPrice: "10,000",
    });
  });

  it("resolves gpt-5.6-sol and glm-5.3 standard token ratio models accurately", () => {
    const gpt5Sol = {
      quota_type: 0,
      model_ratio: 0.003,
      model_price: 0,
      completion_ratio: 5,
    };
    expect(resolveModelPricing(gpt5Sol)).toEqual({
      priceUnit: "per-million-tokens",
      inputPrice: "3,000",
      outputPrice: "15,000",
    });

    const glm53 = {
      quota_type: 0,
      model_ratio: 0.00075,
      model_price: 0,
      completion_ratio: 2,
    };
    expect(resolveModelPricing(glm53)).toEqual({
      priceUnit: "per-million-tokens",
      inputPrice: "750",
      outputPrice: "1,500",
    });
  });
});
