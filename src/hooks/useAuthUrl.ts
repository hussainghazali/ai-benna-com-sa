import { useLocation } from "react-router-dom";
import { buildAuthUrl } from "@/lib/safe-redirect";

/**
 * Link target for "log in" / "sign up" buttons that returns the shopper to
 * the page they are on once they authenticate.
 */
export const useAuthUrl = (path: "/welcome" | "/login" | "/register" = "/welcome"): string => {
  const { pathname, search } = useLocation();
  return buildAuthUrl(path, `${pathname}${search}`);
};
