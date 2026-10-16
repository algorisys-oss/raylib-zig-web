/**
 * The light/dark toggle (ziglang.in's, trimmed).
 *
 * An untouched page opens light. `data-theme` on <html> exists only once the
 * reader picks a mode; the inline script in Base.astro restores that choice
 * before first paint. The button ships `hidden` and is revealed here, so a
 * reader with JavaScript off is not offered a control that cannot work.
 */

const KEY = "theme";
type Theme = "light" | "dark";

const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>(".theme-toggle");

function current(): Theme {
  return root.dataset.theme === "dark" ? "dark" : "light";
}

/** The button names the mode a click would switch to. */
function paint(): void {
  if (!button) return;
  const next: Theme = current() === "dark" ? "light" : "dark";
  button.dataset.next = next;
  button.setAttribute("aria-label", `Switch to ${next} theme`);
}

if (button) {
  button.hidden = false;
  paint();
  button.addEventListener("click", () => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode: the choice holds for this page only.
    }
    paint();
  });
}
