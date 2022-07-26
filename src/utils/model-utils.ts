export const isTrueString = (v?: string) => Boolean(
  v && ['YES', 'yes', 'Y', 'y', 'TRUE', 'true', 'ON', 'on', '1'].includes(v),
);
