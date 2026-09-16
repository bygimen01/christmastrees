import { useEffect } from "react";

let LockCount = 0;
let PreviousBodyOverflow = "";
let PreviousBodyPaddingRight = "";
let PreviousHtmlOverflow = "";

export function useBodyScrollLock(Locked: boolean) {
  useEffect(() => {
    if (!Locked) {
      return;
    }

    if (LockCount === 0) {
      const ScrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      const SupportsStableScrollbarGutter = typeof CSS !== "undefined" && CSS.supports("scrollbar-gutter", "stable");
      PreviousBodyOverflow = document.body.style.overflow;
      PreviousBodyPaddingRight = document.body.style.paddingRight;
      PreviousHtmlOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      if (!SupportsStableScrollbarGutter && ScrollbarWidth > 0) {
        const CurrentPaddingRight = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.paddingRight = `${CurrentPaddingRight + ScrollbarWidth}px`;
      }

      document.body.classList.add("scroll-locked");
    }

    LockCount += 1;

    return () => {
      LockCount = Math.max(0, LockCount - 1);
      if (LockCount !== 0) {
        return;
      }

      document.body.classList.remove("scroll-locked");
      document.documentElement.style.overflow = PreviousHtmlOverflow;
      document.body.style.overflow = PreviousBodyOverflow;
      document.body.style.paddingRight = PreviousBodyPaddingRight;
    };
  }, [Locked]);
}
