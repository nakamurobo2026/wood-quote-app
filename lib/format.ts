export function yen(value: number | null | undefined) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Math.round(value ?? 0));
}

export function percent(value: number | null | undefined) {
  return `${Math.round((value ?? 0) * 10) / 10}%`;
}

export function dateText(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP").format(new Date(value));
}
