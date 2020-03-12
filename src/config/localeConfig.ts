const availableLocales = ['en', 'pl'];
export const localeValidator = (locale: string): boolean => {
  return availableLocales.includes(locale);
};
