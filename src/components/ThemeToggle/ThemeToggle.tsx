import { Moon, Sun } from "lucide-react";
import { useShop } from "../../context/ShopContext";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { locale, theme, toggleTheme } = useShop();
  const IsDark = theme === "dark";
  const Label = IsDark
    ? locale === "ru" ? "Включить светлую тему" : "Жарық тақырыпты қосу"
    : locale === "ru" ? "Включить тёмную тему" : "Қараңғы тақырыпты қосу";

  return (
    <button
      className={compact ? "theme-toggle is-compact" : "theme-toggle"}
      type="button"
      aria-label={Label}
      aria-pressed={IsDark}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {IsDark ? <Sun size={17} /> : <Moon size={17} />}
      </span>
      {!compact && <span>{IsDark ? (locale === "ru" ? "Светлая" : "Жарық") : (locale === "ru" ? "Тёмная" : "Қараңғы")}</span>}
    </button>
  );
}
