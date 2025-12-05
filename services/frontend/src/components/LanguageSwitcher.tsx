import { useLanguage } from "@/hooks/useLanguage";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Locale } from "@/types/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation("common");

  return (
    <div>
      <div className="hidden md:block">
        <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("language.selectLanguage")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt-BR">{t("language.portuguese")}</SelectItem>
            <SelectItem value="en">{t("language.english")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:hidden">
        <select
          aria-label={t("language.selectLanguage")}
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className={cn(
            "h-9 text-sm rounded-md border px-2",
            "bg-card/80 backdrop-blur-sm w-28"
          )}
        >
          <option value="pt-BR">{t("language.portugueseShort")}</option>
          <option value="en">{t("language.englishShort")} </option>
        </select>
      </div>
    </div>
  );
}
