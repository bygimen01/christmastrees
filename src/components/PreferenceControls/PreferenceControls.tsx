import { currencyConfig } from "../../config/currency";
import { useShop } from "../../context/ShopContext";
import { CurrencyCode, Locale } from "../../types";

const languages: Array<{ code: Locale; label: string }> = [
  { code: "ru", label: "RU" },
  { code: "kk", label: "KZ" }
];

const currencies: CurrencyCode[] = ["KZT", "RUB"];

export function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, currency, setCurrency } = useShop();

  return (
    <div className={compact ? "preference-controls is-compact" : "preference-controls"}>
      <div className="segmented-control" aria-label={locale === "ru" ? "Язык" : "Тіл"}>
        {languages.map((language) => (
          <button
            type="button"
            key={language.code}
            className={locale === language.code ? "is-active" : ""}
            aria-pressed={locale === language.code}
            onClick={(Event) => {
              Event.stopPropagation();
              setLocale(language.code);
            }}
          >
            {language.label}
          </button>
        ))}
      </div>
      <div className="segmented-control currency-control" aria-label={locale === "ru" ? "Валюта" : "Валюта"}>
        {currencies.map((code) => (
          <button
            type="button"
            key={code}
            className={currency === code ? "is-active" : ""}
            aria-pressed={currency === code}
            onClick={(Event) => {
              Event.stopPropagation();
              setCurrency(code);
            }}
          >
            {compact ? currencyConfig[code].symbol : currencyConfig[code].label}
          </button>
        ))}
      </div>
    </div>
  );
}
