import { describe, expect, it } from "vitest";
import { formatCurrency, formatCurrencyFromKobo } from "./formatters";

describe("formatCurrency utility", () => {
  it("formats NGN from kobo using Intl.NumberFormat", () => {
    expect(formatCurrencyFromKobo(150000, { currency: "NGN" })).toBe("₦1,500.00");
    expect(formatCurrencyFromKobo("250000", { currency: "NGN" })).toBe("₦2,500.00");
  });

  it("formats USD with two decimals", () => {
    expect(formatCurrency(1250, { currency: "USD" })).toBe("$1,250.00");
  });

  it("formats custom currency symbols for unknown currencies", () => {
    expect(formatCurrency(1200, { currency: "USDT" })).toBe("1,200.00 USDT");
  });

  it("returns zero for invalid values", () => {
    expect(formatCurrency(null)).toBe("₦0.00");
    expect(formatCurrencyFromKobo("", { currency: "NGN" })).toBe("₦0.00");
  });
});
