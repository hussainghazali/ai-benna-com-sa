/**
 * Same-origin, path-only redirect targets. Anything else becomes "/".
 * Shared by the login page, the welcome page, the OTP page and the login popup.
 *
 * "%" and "." are allowed because real storefront URLs contain them
 * (percent-encoded Arabic slugs, slugs with dots). Rejecting them used to
 * send shoppers to the homepage after logging in. The same-origin check
 * below is what keeps this safe.
 */
const ALLOWED_REDIRECT_PATHS = /^\/[a-zA-Z0-9\-_.~%+@,:()/]*$/;

/** Characters that must never appear raw (unencoded) in a redirect target. */
const FORBIDDEN_RAW_CHARS = /[\s<>"'`\\]/;

/** Auth pages are never a valid "come back to" target (would loop). */
const AUTH_PATHS = [
  "/welcome",
  "/login",
  "/register",
  "/otp",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
];

export const isAuthPath = (pathname: string): boolean =>
  AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const validateRedirectTarget = (target: string | null | undefined): string => {
  if (!target || typeof window === "undefined") return "/";
  if (FORBIDDEN_RAW_CHARS.test(target)) return "/";
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    if (!ALLOWED_REDIRECT_PATHS.test(url.pathname)) return "/";
    if (isAuthPath(url.pathname)) return "/";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
};

type AuthEntryPath = "/welcome" | "/login" | "/register" | "/forgot-password";

/**
 * Build a link to an auth page that brings the shopper back to where they
 * were once they sign in. `target` defaults to the current page. Home and
 * auth pages add no `redirect` param (nothing to come back to).
 */
export const buildAuthUrl = (
  path: AuthEntryPath = "/welcome",
  target?: string | null,
): string => {
  const raw =
    target ??
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/");
  const safe = validateRedirectTarget(raw);
  return safe === "/" ? path : `${path}?redirect=${encodeURIComponent(safe)}`;
};
