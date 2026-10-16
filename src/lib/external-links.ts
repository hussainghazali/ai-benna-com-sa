// Links that leave this app (store, chat, BOQ, vendor portal, social, ...) open
// in a new tab so the user keeps their place here. One delegated listener
// covers every <a>, including backend-provided links, without per-link attrs.
export function installExternalLinkHandler(): void {
  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.hasAttribute("download")) return;
      const target = a.getAttribute("target");
      if (target && target !== "_self") return; // already explicit (e.g. _blank)
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.origin === window.location.origin) return;
      e.preventDefault();
      window.open(url.href, "_blank", "noopener,noreferrer");
    },
    true,
  );
}
