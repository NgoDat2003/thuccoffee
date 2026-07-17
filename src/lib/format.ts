export function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\s|\(|\)/g, '')}`;
}
