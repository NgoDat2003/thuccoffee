export function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getUTCFullYear()}`;
}

export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\s|\(|\)/g, '')}`;
}