export function formatVolume(ml: number) {
  if (ml >= 1000) {
    const l = ml / 1000;
    return (Number.isInteger(l) ? l.toFixed(0) : l.toFixed(1)) + 'L';
  }
  return `${ml}ml`;
}

export function formatDeposit(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    cents / 100
  );
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(iso));
}

export function titleCase(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function pageRange(total: number, current: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = new Set<number | -1>([
    1,
    2,
    total - 1,
    total,
    current - 1,
    current,
    current + 1,
  ]);
  const arr = Array.from(out)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => Number(a) - Number(b));
  const withDots: (number | -1)[] = [];
  for (let i = 0; i < arr.length; i++) {
    withDots.push(arr[i]);
    if (i < arr.length - 1 && (arr[i + 1] as number) - (arr[i] as number) > 1)
      withDots.push(-1);
  }
  return withDots;
}
