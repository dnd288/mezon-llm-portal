// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parseTopUp } from "@/app/(portal)/vouchers/page";

describe("Voucher / top-up log parsing (parseTopUp)", () => {
  it("parses CUSTOM-prefix voucher logs", () => {
    expect(parseTopUp("通过兑换码充值 mzđ500000.000000 额度，兑换码ID 97")).toMatchObject({
      label: "Nạp bằng voucher",
      quota: 500000,
    });
  });

  it("parses CUSTOM-postfix voucher logs (legacy)", () => {
    expect(parseTopUp("通过兑换码充值 500000.000000 mzđ 额度，兑换码ID 97")).toMatchObject({
      label: "Nạp bằng voucher",
      quota: 500000,
    });
  });

  it("parses Mezon on-chain logs in both currency positions", () => {
    expect(parseTopUp("Mezon top-up successful: transferred 1000000 dong, credited mzđ1000000.000000 (1:1), tx 0xabc")).toMatchObject({
      label: "Nạp qua Mezon",
      quota: 1000000,
    });
    expect(parseTopUp("Mezon top-up successful: transferred 1000000 dong, credited 1000000 mzđ (1:1), tx 0xabc")).toMatchObject({
      label: "Nạp qua Mezon",
      quota: 1000000,
    });
  });

  it("parses Waffo Pancake logs in both currency positions", () => {
    expect(parseTopUp("Waffo Pancake充值成功，充值额度: mzđ500000.000000，支付金额: 12.34")).toMatchObject({
      label: "Nạp qua Waffo Pancake",
      quota: 500000,
    });
    expect(parseTopUp("Waffo Pancake充值成功，充值额度: 500000.000000 mzđ，支付金额: 12.34")).toMatchObject({
      label: "Nạp qua Waffo Pancake",
      quota: 500000,
    });
  });

  it("parses generic 充值 logs", () => {
    expect(parseTopUp("使用在线充值成功，充值额度: mzđ250000.000000")).toMatchObject({
      label: "Nạp quota",
      quota: 250000,
    });
  });
});
