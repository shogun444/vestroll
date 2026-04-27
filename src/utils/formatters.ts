export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  isKobo?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const ISO_CURRENCIES = new Set([
  "NGN",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "ZAR",
  "KES",
  "GHS",
  "AED",
  "INR",
]);

function parseNumberValue(value: string | number | bigint | null | undefined): number {
  if (value == null || value === "") {
    return NaN;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return Number(String(value).replace(/,/g, ""));
}

export function formatCurrency(
  amount: string | number | bigint | null | undefined,
  options: FormatCurrencyOptions = {},
): string {
  const currency = options.currency ?? "NGN";
  const locale = options.locale ?? (currency === "NGN" ? "en-NG" : "en-US");
  const isKobo = options.isKobo ?? false;
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;

  const numericValue = parseNumberValue(amount);
  const displayValue = isKobo ? numericValue / 100 : numericValue;
  const normalizedValue = Number.isFinite(displayValue) ? displayValue : 0;

  if (!ISO_CURRENCIES.has(currency.toUpperCase())) {
    return normalizedValue.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }) + ` ${currency}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(normalizedValue);
}

export function formatCurrencyFromKobo(
  amount: string | number | bigint | null | undefined,
  options: Omit<FormatCurrencyOptions, "isKobo"> = {},
): string {
  return formatCurrency(amount, { ...options, isKobo: true });
}
