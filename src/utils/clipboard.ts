/**
 * Kopiert einen Text robust und plattformübergreifend in die Zwischenablage.
 * Unterstützt moderne Browser (Desktop & Mobile) via Clipboard-API sowie
 * ältere WebViews und mobile Browser via execCommand-Fallback.
 *
 * @param text - Der zu kopierende Text (z. B. vollständige URL)
 * @returns Promise<boolean> - true bei erfolgreichem Kopiervorgang, sonst false
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }

  // 1. Primär: Moderne Clipboard API (sicherer Kontext: HTTPS / localhost)
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback nutzen, falls Clipboard-Permission verweigert oder eingeschränkt wurde
    }
  }

  // 2. Sekundär: Fallback über unsichtbares Textarea-Element (iOS Safari & WebViews)
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // Unsichtbar positionieren außerhalb des Viewports
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      textarea.style.opacity = "0";
      textarea.setAttribute("readonly", "");
      textarea.setAttribute("aria-hidden", "true");

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch {
      return false;
    }
  }

  return false;
}
