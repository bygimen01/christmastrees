import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import { copy, getProductTitle } from "../../i18n/content";
import { Locale } from "../../types";
import { ImageLightbox } from "../ImageLightbox/ImageLightbox";
import { SmartImage } from "../SmartImage/SmartImage";

type ProductGalleryProps = {
  images: string[];
  title: string;
  locale: Locale;
};

export function ProductGallery({ images, title, locale }: ProductGalleryProps) {
  const SafeImages = useMemo(() => (images.length ? images : ["/tree-placeholder.svg"]), [images]);
  const [ActiveIndex, setActiveIndex] = useState(0);
  const [LightboxOpen, setLightboxOpen] = useState(false);
  const TouchStartX = useRef<number | null>(null);
  const t = copy[locale];
  const ProductTitle = getProductTitle(title, locale);
  const LightboxItems = useMemo(
    () => SafeImages.map((Image, Index) => ({ src: Image, alt: `${ProductTitle}, ${locale === "ru" ? "фото" : "фото"} ${Index + 1}` })),
    [SafeImages, ProductTitle, locale]
  );

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [images]);

  const ShowPrevious = () => setActiveIndex((Current) => (Current - 1 + SafeImages.length) % SafeImages.length);
  const ShowNext = () => setActiveIndex((Current) => (Current + 1) % SafeImages.length);

  const HandleTouchStart = (Event: TouchEvent) => {
    TouchStartX.current = Event.touches[0]?.clientX ?? null;
  };

  const HandleTouchEnd = (Event: TouchEvent) => {
    if (TouchStartX.current === null || SafeImages.length < 2) {
      TouchStartX.current = null;
      return;
    }

    const EndX = Event.changedTouches[0]?.clientX ?? TouchStartX.current;
    const Distance = EndX - TouchStartX.current;
    TouchStartX.current = null;

    if (Math.abs(Distance) < 44) {
      return;
    }

    if (Distance < 0) {
      ShowNext();
    } else {
      ShowPrevious();
    }
  };

  return (
    <section className="product-gallery" aria-label={t.product.gallery}>
      <div className="gallery-main" onTouchStart={HandleTouchStart} onTouchEnd={HandleTouchEnd}>
        <button className="gallery-main-image" type="button" aria-label={t.product.gallery} onClick={() => setLightboxOpen(true)}>
          <SmartImage src={SafeImages[ActiveIndex]} alt={ProductTitle} loading="eager" decoding="async" />
        </button>
        <button className="gallery-expand" type="button" aria-label={t.product.gallery} onClick={() => setLightboxOpen(true)}>
          <Expand size={18} aria-hidden="true" />
        </button>
        {SafeImages.length > 1 && (
          <>
            <button className="gallery-inline-nav is-prev" type="button" aria-label={t.product.previousImage} onClick={ShowPrevious}>
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button className="gallery-inline-nav is-next" type="button" aria-label={t.product.nextImage} onClick={ShowNext}>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </>
        )}
        <span className="gallery-counter">{ActiveIndex + 1} / {SafeImages.length}</span>
      </div>

      {SafeImages.length > 1 && (
        <div className="gallery-thumbs" aria-label={t.product.gallery}>
          {SafeImages.map((Image, Index) => (
            <button
              type="button"
              key={`${Image}-${Index}`}
              className={ActiveIndex === Index ? "is-active" : ""}
              aria-label={`${t.product.gallery} ${Index + 1}`}
              aria-current={ActiveIndex === Index ? "true" : undefined}
              onClick={() => setActiveIndex(Index)}
            >
              <SmartImage src={Image} alt="" loading="lazy" decoding="async" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        open={LightboxOpen}
        items={LightboxItems}
        activeIndex={ActiveIndex}
        closeLabel={t.nav.close}
        previousLabel={t.product.previousImage}
        nextLabel={t.product.nextImage}
        zoomLabel={locale === "ru" ? "Увеличить или уменьшить фото" : "Фотосуретті үлкейту немесе кішірейту"}
        onClose={() => setLightboxOpen(false)}
        onChange={setActiveIndex}
      />
    </section>
  );
}
