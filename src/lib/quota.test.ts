import { describe, it, expect } from "vitest";
import {
  formatQuota,
  quotaToDollars,
  formatTokens,
  formatDate,
  formatDuration,
  relativeTime,
} from "./quota";

describe("quota utilities", () => {
  describe("formatQuota", () => {
    it("formats small quota numbers", () => {
      expect(formatQuota(500)).toBe("500");
    });

    it("formats thousands as K", () => {
      expect(formatQuota(1500)).toBe("1.5K");
      expect(formatQuota(50000)).toBe("50.0K");
    });

    it("formats millions as M", () => {
      expect(formatQuota(2500000)).toBe("2.50M");
    });
  });

  describe("quotaToDollars", () => {
    it("converts 500,000 quota to $1.0000", () => {
      expect(quotaToDollars(500_000)).toBe("$1.0000");
    });

    it("converts 250,000 quota to $0.5000", () => {
      expect(quotaToDollars(250_000)).toBe("$0.5000");
    });

    it("converts 0 quota to $0.0000", () => {
      expect(quotaToDollars(0)).toBe("$0.0000");
    });
  });

  describe("formatTokens", () => {
    it("formats token counts under 1,000", () => {
      expect(formatTokens(850)).toBe("850");
    });

    it("formats thousands of tokens", () => {
      expect(formatTokens(12500)).toBe("12.5K");
    });

    it("formats millions of tokens", () => {
      expect(formatTokens(3200000)).toBe("3.2M");
    });
  });

  describe("formatDate", () => {
    it("returns dash for zero or falsy timestamp", () => {
      expect(formatDate(0)).toBe("—");
    });

    it("formats valid unix timestamp", () => {
      const formatted = formatDate(1700000000);
      expect(formatted).not.toBe("—");
      expect(formatted.length).toBeGreaterThan(5);
    });
  });

  describe("formatDuration", () => {
    it("returns dash for zero or negative seconds", () => {
      expect(formatDuration(0)).toBe("—");
      expect(formatDuration(-5)).toBe("—");
    });

    it("formats milliseconds for less than 1s", () => {
      expect(formatDuration(0.45)).toBe("450ms");
    });

    it("formats seconds for less than 60s", () => {
      expect(formatDuration(12.34)).toBe("12.3s");
    });

    it("formats minutes and seconds for >= 60s", () => {
      expect(formatDuration(125)).toBe("2m 5s");
    });
  });

  describe("relativeTime", () => {
    it("returns 'vừa xong' for recent times", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(relativeTime(now - 10)).toBe("vừa xong");
    });

    it("returns minutes ago", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(relativeTime(now - 180)).toBe("3 phút trước");
    });

    it("returns hours ago", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(relativeTime(now - 7200)).toBe("2 giờ trước");
    });

    it("returns days ago", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(relativeTime(now - 172800)).toBe("2 ngày trước");
    });
  });
});
