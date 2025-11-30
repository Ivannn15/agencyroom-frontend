export function formatCurrency(value?: number | null, currency = "RUB") {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 1
  }).format(value);
}

export function formatNumber(value?: number | null, fractionDigits = 1) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: fractionDigits
  }).format(value);
}

export function formatPeriod(period?: string) {
  if (!period) return "—";
  // Expect YYYY-MM
  const [year, month] = period.split("-");
  if (!year || !month) return period;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long" });
}
