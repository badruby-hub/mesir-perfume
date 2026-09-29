// Armenian dram formatting — space-separated thousands, symbol after the
// number (e.g. "144 400 ֏"), matching how AMD amounts are normally
// written. Used everywhere a price is displayed, and in Telegram messages.
export function formatAMD(amount: number): string {
  return `${Math.round(amount).toLocaleString('ru-RU')} ֏`;
}

// Slide prices are stored as free text (e.g. "144400" or legacy "$380").
export function parsePrice(price: string | number): number {
  return parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;
}

// Russian pluralization helper (1 товар / 2 товара / 5 товаров).
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
