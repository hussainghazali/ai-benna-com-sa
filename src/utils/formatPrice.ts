/**
 * Locale-aware number formatting helpers.
 * Reads <html lang> (set by LanguageContext) so any component can format
 * numbers in Arabic-Indic digits when the app is in Arabic mode — no hook
 * required. Pure functions, safe in any render path.
 */

const getLocale = (): string => {
  // Prefer the user's saved language (LanguageContext writes "en"|"ar" here
  // synchronously). Fall back to <html lang>, then English. This avoids
  // mis-formatting on first paint before React effects run.
  let lang: string | null = null;
  try {
    if (typeof localStorage !== "undefined") {
      lang = localStorage.getItem("language");
    }
  } catch {
    // localStorage may be unavailable (SSR / privacy mode) — ignore.
  }
  if (!lang && typeof document !== "undefined") {
    lang = document.documentElement.lang || null;
  }
  return lang === "ar" ? "ar-SA" : "en-US";
};

export const locNum = (
  n: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
): string => {
  const num = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  if (num === null || num === undefined || isNaN(num as number)) return "0";
  return (num as number).toLocaleString(getLocale(), options);
};

/** Price with 2 decimals */
export const locPrice = (n: number | string | null | undefined): string =>
  locNum(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
