export type Locale = "kg" | "ru" | "en";

export type LocalizedString = {
  kg: string;
  ru: string;
  en: string;
};

export type LocalizedOptional = {
  kg?: string;
  ru?: string;
  en?: string;
};

export function pickLocale<T extends LocalizedString>(
  value: T,
  locale: Locale,
): string {
  return value[locale] || value.ru || value.en || value.kg || "";
}
