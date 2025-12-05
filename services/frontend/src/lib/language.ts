import type { Locale } from "@/types/locale";

const STORAGE_KEY = "app:locale";

export const DEFAULT_LOCALE: Locale = "pt-BR";

export function getLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return DEFAULT_LOCALE;
    return v as Locale;
  } catch (e) {
    console.error("[language] getLocale: erro acessando localStorage:", e);
    return DEFAULT_LOCALE;
  }
}

export function setLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch (e) {
    console.error("[language] setLocale: erro salvando localStorage:", e);
  }
}
