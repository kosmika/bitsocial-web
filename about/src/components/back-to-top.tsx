import { ArrowUp } from "lucide-react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { highlightedCtaClassName } from "@/components/card-inline-cta";
import { getScrollBehavior } from "@/lib/utils";

function scrollToTop(event: MouseEvent<HTMLButtonElement>) {
  window.scrollTo({ top: 0, left: 0, behavior: getScrollBehavior() });
  // A pointer click (event.detail > 0) leaves focus on the button, which some
  // browsers keep rendering as a lingering "selected" focus ring once it
  // scrolls back into view. Drop focus for pointer activation, but keep it for
  // keyboard users (event.detail === 0) so their focus ring and tab position
  // are preserved.
  if (event.detail > 0) {
    event.currentTarget.blur();
  }
}

export default function BackToTop() {
  const { t } = useTranslation();

  return (
    <div className="js-only px-6">
      <div className="mx-auto flex max-w-7xl justify-end">
        <button type="button" onClick={scrollToTop} className={`${highlightedCtaClassName} gap-2`}>
          {t("nav.backToTop")}
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
