import { RefObject, useEffect, useRef } from "react";

type DialogFocusTrapOptions = {
  Active: boolean;
  DialogRef: RefObject<HTMLElement | null>;
  InitialFocusRef?: RefObject<HTMLElement | null>;
  ReturnFocusRef?: RefObject<HTMLElement | null>;
  OnEscape?: () => void;
};

const FocusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogFocusTrap({ Active, DialogRef, InitialFocusRef, ReturnFocusRef, OnEscape }: DialogFocusTrapOptions) {
  const PreviousFocusRef = useRef<HTMLElement | null>(null);
  const OnEscapeRef = useRef(OnEscape);

  OnEscapeRef.current = OnEscape;

  useEffect(() => {
    if (!Active) {
      return;
    }

    PreviousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const FocusInitialElement = () => {
      const Dialog = DialogRef.current;
      if (!Dialog) {
        return;
      }

      const Focusable = Array.from(Dialog.querySelectorAll<HTMLElement>(FocusableSelector));
      const Target = InitialFocusRef?.current ?? Focusable[0] ?? Dialog;
      Target.focus({ preventScroll: true });
    };

    const AnimationFrame = window.requestAnimationFrame(FocusInitialElement);

    const HandleKeyDown = (Event: KeyboardEvent) => {
      if (Event.key === "Escape" && OnEscapeRef.current) {
        Event.preventDefault();
        OnEscapeRef.current();
        return;
      }

      if (Event.key !== "Tab") {
        return;
      }

      const Dialog = DialogRef.current;
      if (!Dialog) {
        return;
      }

      const Focusable = Array.from(Dialog.querySelectorAll<HTMLElement>(FocusableSelector));
      if (!Focusable.length) {
        Event.preventDefault();
        Dialog.focus({ preventScroll: true });
        return;
      }

      const First = Focusable[0];
      const Last = Focusable[Focusable.length - 1];
      const ActiveElement = document.activeElement;

      if (!Dialog.contains(ActiveElement)) {
        Event.preventDefault();
        (Event.shiftKey ? Last : First).focus({ preventScroll: true });
        return;
      }

      if (Event.shiftKey && ActiveElement === First) {
        Event.preventDefault();
        Last.focus({ preventScroll: true });
      } else if (!Event.shiftKey && ActiveElement === Last) {
        Event.preventDefault();
        First.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", HandleKeyDown);

    return () => {
      window.cancelAnimationFrame(AnimationFrame);
      window.removeEventListener("keydown", HandleKeyDown);
      const ReturnTarget = ReturnFocusRef?.current ?? PreviousFocusRef.current;
      ReturnTarget?.focus({ preventScroll: true });
      PreviousFocusRef.current = null;
    };
  }, [Active, DialogRef, InitialFocusRef, ReturnFocusRef]);
}
