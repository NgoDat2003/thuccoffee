const DATE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;

export function parseVietnameseDate(value: string): Date {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Ngày không đúng định dạng DD.MM.YYYY: ${value}`);
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new Error(`Ngày không tồn tại: ${value}`);
  }

  return date;
}
