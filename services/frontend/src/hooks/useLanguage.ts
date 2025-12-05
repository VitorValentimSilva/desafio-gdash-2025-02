import { useCallback, useEffect, useState } from "react";
import {
  getLocale as getStoredLocale,
  setLocale as setStoredLocale,
  DEFAULT_LOCALE,
} from "@/lib/language";
import type { Locale } from "@/types/locale";
import i18n from "@/languageConfig";

export function useLanguage() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      return getStoredLocale() ?? DEFAULT_LOCALE;
    } catch (e) {
      console.error("[useLanguage] falha ao ler localStorage/getLocale:", e);
      return DEFAULT_LOCALE;
    }
  });

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "app:locale") {
        try {
          setLocaleState(getStoredLocale());
        } catch (err) {
          console.error(
            "[useLanguage] falha ao atualizar locale via storage event:",
            err
          );
        }
      }
    }
    function onLangChange() {
      try {
        setLocaleState(getStoredLocale());
      } catch (err) {
        console.error(
          "[useLanguage] falha ao atualizar locale via languagechange:",
          err
        );
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("languagechange", onLangChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("languagechange", onLangChange);
    };
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setStoredLocale(l);
    setLocaleState(l);
    try {
      i18n.changeLanguage(l);
      window.dispatchEvent(new Event("languagechange"));
    } catch (e) {
      console.error("[useLanguage] dispatchEvent('languagechange') falhou:", e);
    }
  }, []);

  return { locale, setLocale };
}
