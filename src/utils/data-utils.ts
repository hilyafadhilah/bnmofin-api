export const isTrueString = (v?: string) => Boolean(
  v && ['YES', 'yes', 'Y', 'y', 'TRUE', 'true', 'ON', 'on', '1'].includes(v),
);

export function moneyFormat(num: number, currency: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
  }).format(num);
}

export function toSentenceCase(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function toTitleCase(str: string) {
  return str.split(' ').map(toSentenceCase).join(' ');
}
