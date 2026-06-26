export function formatQty(qty: number): string {
  if (!qty) return '0';
  return String(parseFloat((Math.round(qty * 100) / 100).toFixed(2)));
}
