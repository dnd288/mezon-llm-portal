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
  it("formats numbers in millions with M suffix", () => {
    expect(formatMznd(1_250_000)).toBe("1.25M");
    expect(formatMznd(18_750_000)).toBe("18.75M");
  });

  it("formats numbers in thousands with K suffix", () => {
    expect(formatMznd(40_000)).toBe("40.0K");
    expect(formatMznd(200_000)).toBe("200.0K");
    expect(formatMznd(20_000)).toBe("20.0K");
    expect(formatMznd(1_000)).toBe("1.0K");
  });

  it("formats small numbers with locale string", () => {
    expect(formatMznd(20)).toBe("20");
    expect(formatMznd(375)).toBe("375");
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
      inputPrice: "40.0K",
      outputPrice: "200.0K",
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
      inputPrice: "20.0K",
      outputPrice: "100.0K",
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
      inputPrice: "5.0K",
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

  it("resolves legacy token ratio models (quota_type === 0)", () => {
    const model = {
      quota_type: 0,
      model_ratio: 0.002,
      model_price: 0,
      completion_ratio: 5,
    };

    const resolution = resolveModelPricing(model);
    expect(resolution).toEqual({
      priceUnit: "per-million-tokens",
      inputPrice: "1.0K",
      outputPrice: "5.0K",
    });
  });
});
