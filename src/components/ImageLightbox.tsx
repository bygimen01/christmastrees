import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from "lucide-react";
import { TouchEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { SmartImage } from "./SmartImage";

export type LightboxItem = {
  src: string;
  alt: string;
  caption?: string;
};

type ImageLightboxProps = {
  open: boolean;
  items: LightboxItem[];
  activeIndex: number;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  zoomLabel: string;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function ImageLightbox({
  open,
  items,
  activeIndex,
  closeLabel,
  previousLabel,
  nextLabel,
  zoomLabel,
  onClose,
  onChange
}: ImageLightboxProps) {
  const [Zoomed, setZoomed] = useState(false);
  const TouchStartX = useRef<number | null>(null);
  const CloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const DialogRef = useRef<HTMLElement | null>(null);
  const PreviousFocusRef = useRef<HTMLElement | null>(null);
  const OnCloseRef = useRef(onClose);
  const OnChangeRef = useRef(onChange);
  const SafeIndex = Math.min(Math.max(activeIndex, 0), Math.max(0, items.length - 1));
  const ActiveItem = items[SafeIndex];

  OnCloseRef.current = onClose;
  OnChangeRef.current = onChange;
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) {
      setZoomed(false);
      return;
    }

    PreviousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => CloseButtonRef.current?.focus());

    return () => {
      PreviousFocusRef.current?.focus({ preventScroll: true });
      PreviousFocusRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const HandleKeyDown = (Event: KeyboardEvent) => {
      if (Event.key === "Escape") {
        Event.preventDefault();
        OnCloseRef.current();
        return;
      }

      if (Event.key === "ArrowRight" && items.length > 1) {
        Event.preventDefault();
        OnChangeRef.current((SafeIndex + 1) % items.length);
        setZoomed(false);
        return;
      }

      if (Event.key === "ArrowLeft" && items.length > 1) {
        Event.preventDefault();
        OnChangeRef.current((SafeIndex - 1 + items.length) % items.length);
        setZoomed(false);
        return;
      }

      if (Event.key !== "Tab" || !DialogRef.current) {
        return;
      }

      const Focusable = Array.from(DialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
      if (!Focusable.length) {
        return;
      }

      const First = Focusable[0];
      const Last = Focusable[Focusable.length - 1];
      if (Event.shiftKey && document.activeElement === First) {
        Event.preventDefault();
        Last.focus();
      } else if (!Event.shiftKey && document.activeElement === Last) {
        Event.preventDefault();
        First.focus();
      }
    };

    window.addEventListener("keydown", HandleKeyDown);
    return () => window.removeEventListener("keydown", HandleKeyDown);
  }, [open, items.length, SafeIndex]);

  if (!open || !ActiveItem || typeof document === "undefined") {
    return null;
  }

  const ChangeImage = (Direction: -1 | 1) => {
    OnChangeRef.current((SafeIndex + Direction + items.length) % items.length);
    setZoomed(false);
  };

  const HandleTouchStart = (Event: TouchEvent) => {
    TouchStartX.current = Event.touches[0]?.clientX ?? null;
  };

  const HandleTouchEnd = (Event: TouchEvent) => {
    if (TouchStartX.current === null || items.length < 2 || Zoomed) {
      TouchStartX.current = null;
      return;
    }

    const EndX = Event.changedTouches[0]?.clientX ?? TouchStartX.current;
    const Distance = EndX - TouchStartX.current;
    TouchStartX.current = null;

    if (Math.abs(Distance) >= 46) {
      ChangeImage(Distance < 0 ? 1 : -1);
    }
  };

  return createPortal(
    <div className="media-lightbox" role="presentation">
      <button className="media-lightbox-backdrop" type="button" aria-label={closeLabel} onClick={() => OnCloseRef.current()} />
      <section ref={DialogRef} className="media-lightbox-dialog" role="dialog" aria-modal="true" aria-label={ActiveItem.alt}>
        <header className="media-lightbox-header">
          <div className="media-lightbox-counter">
            <strong>{SafeIndex + 1}</strong>
            <span>/ {items.length}</span>
          </div>
          <div className="media-lightbox-actions">
            <button type="button" aria-label={zoomLabel} aria-pressed={Zoomed} onClick={() => setZoomed((Current) => !Current)}>
              {Zoomed ? <Minimize2 size={19} aria-hidden="true" /> : <Maximize2 size={19} aria-hidden="true" />}
            </button>
            <button ref={CloseButtonRef} type="button" aria-label={closeLabel} onClick={() => OnCloseRef.current()}>
              <X size={21} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="media-lightbox-stage" onTouchStart={HandleTouchStart} onTouchEnd={HandleTouchEnd}>
          {items.length > 1 && (
            <button className="media-lightbox-nav is-prev" type="button" aria-label={previousLabel} onClick={() => ChangeImage(-1)}>
              <ChevronLeft size={25} aria-hidden="true" />
            </button>
          )}
          <button className={Zoomed ? "media-lightbox-image is-zoomed" : "media-lightbox-image"} type="button" aria-label={zoomLabel} onClick={() => setZoomed((Current) => !Current)}>
            <SmartImage src={ActiveItem.src} alt={ActiveItem.alt} loading="eager" decoding="async" />
          </button>
          {items.length > 1 && (
            <button className="media-lightbox-nav is-next" type="button" aria-label={nextLabel} onClick={() => ChangeImage(1)}>
              <ChevronRight size={25} aria-hidden="true" />
            </button>
          )}
        </div>

        {(ActiveItem.caption || items.length > 1) && (
          <footer className="media-lightbox-footer">
            {ActiveItem.caption && <p>{ActiveItem.caption}</p>}
            {items.length > 1 && (
              <div className="media-lightbox-thumbs" aria-label={ActiveItem.alt}>
                {items.map((Item, Index) => (
                  <button
                    type="button"
                    key={`${Item.src}-${Index}`}
                    className={Index === SafeIndex ? "is-active" : ""}
                    aria-label={`${Index + 1}`}
                    aria-current={Index === SafeIndex ? "true" : undefined}
                    onClick={() => {
                      OnChangeRef.current(Index);
                      setZoomed(false);
                    }}
                  >
                    <SmartImage src={Item.src} alt="" loading="lazy" decoding="async" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}
