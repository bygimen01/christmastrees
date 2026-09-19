import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import opinions from "../../../data/opinionsData.json";
import { useShop } from "../../context/ShopContext";
import { copy } from "../../i18n/content";
import { ImageLightbox } from "../ImageLightbox/ImageLightbox";
import { SmartImage } from "../SmartImage/SmartImage";

export function ReviewsCarousel() {
  const { locale } = useShop();
  const t = copy[locale];
  const TrackRef = useRef<HTMLDivElement | null>(null);
  const [CanScrollBack, setCanScrollBack] = useState(false);
  const [CanScrollForward, setCanScrollForward] = useState(true);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [PhotoIndex, setPhotoIndex] = useState(0);
  const [PhotoLightboxOpen, setPhotoLightboxOpen] = useState(false);
  const Reviews = opinions.reviews;
  const PhotoItems = useMemo(
    () => opinions.photoReviews.map((PhotoReview) => ({
      src: PhotoReview.imageUrl,
      alt: locale === "ru" ? `Фото от ${PhotoReview.authorName}` : `${PhotoReview.authorName} фотосы`,
      caption: `${PhotoReview.authorName} · ${PhotoReview.text}`
    })),
    [locale]
  );

  const UpdateScrollState = () => {
    const Track = TrackRef.current;
    if (!Track) {
      return;
    }

    const MaxScroll = Math.max(0, Track.scrollWidth - Track.clientWidth);
    setCanScrollBack(Track.scrollLeft > 8);
    setCanScrollForward(Track.scrollLeft < MaxScroll - 8);

    const FirstCard = Track.querySelector<HTMLElement>(".review-card");
    const Gap = Number.parseFloat(window.getComputedStyle(Track).columnGap || window.getComputedStyle(Track).gap || "0");
    const Step = Math.max(1, (FirstCard?.offsetWidth ?? Track.clientWidth) + Gap);
    setCurrentPage(Math.min(Reviews.length, Math.max(1, Math.round(Track.scrollLeft / Step) + 1)));
  };

  useEffect(() => {
    const Track = TrackRef.current;
    if (!Track) {
      return;
    }

    UpdateScrollState();
    Track.addEventListener("scroll", UpdateScrollState, { passive: true });
    window.addEventListener("resize", UpdateScrollState);

    return () => {
      Track.removeEventListener("scroll", UpdateScrollState);
      window.removeEventListener("resize", UpdateScrollState);
    };
  }, [Reviews.length]);

  const Scroll = (Direction: -1 | 1) => {
    const Track = TrackRef.current;
    if (!Track) {
      return;
    }

    const FirstCard = Track.querySelector<HTMLElement>(".review-card");
    const Gap = Number.parseFloat(window.getComputedStyle(Track).columnGap || window.getComputedStyle(Track).gap || "0");
    const Step = Math.max(280, (FirstCard?.offsetWidth ?? Track.clientWidth * 0.8) + Gap);
    Track.scrollBy({ left: Direction * Step, behavior: "smooth" });
  };

  return (
    <section className="reviews-section">
      <div className="container reviews-layout">
        <div className="reviews-heading" data-reveal>
          <span className="eyebrow">{t.home.socialProof}</span>
          <h2>{t.sections.reviews}</h2>
          <div className="reviews-rating">
            <strong>{opinions.rating.toFixed(1)}</strong>
            <span className="review-stars" aria-label={`${opinions.rating}/5`}>
              {[0, 1, 2, 3, 4].map((StarIndex) => (
                <Star key={StarIndex} size={16} fill="currentColor" aria-hidden="true" />
              ))}
            </span>
            <small>{Reviews.length} {t.home.reviewsCountLabel}</small>
          </div>

          <div className="reviews-controls" aria-label={locale === "ru" ? "Навигация по отзывам" : "Пікірлерді навигациялау"}>
            <button type="button" onClick={() => Scroll(-1)} disabled={!CanScrollBack} aria-label={locale === "ru" ? "Предыдущие отзывы" : "Алдыңғы пікірлер"}>
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span>{CurrentPage} / {Reviews.length}</span>
            <button type="button" onClick={() => Scroll(1)} disabled={!CanScrollForward} aria-label={locale === "ru" ? "Следующие отзывы" : "Келесі пікірлер"}>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="reviews-carousel-shell">
          <div className="reviews-track" ref={TrackRef} tabIndex={0}>
            {Reviews.map((Review) => (
              <article className="review-card" key={Review.id}>
                <div className="review-card-top">
                  <div className="review-stars" aria-label={`${Review.rating}/5`}>
                    {[0, 1, 2, 3, 4].map((StarIndex) => (
                      <Star key={StarIndex} size={14} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <span>{Review.date}</span>
                </div>
                <p>“{Review.textFull || Review.textShort}”</p>
                <div className="review-card-footer">
                  <strong>{Review.authorName}</strong>
                  <span>{Review.sourceLabel}</span>
                </div>
              </article>
            ))}
          </div>

          {opinions.photoReviews.length > 0 && (
            <div className="photo-review-block">
              <div className="photo-review-heading">
                <strong>{locale === "ru" ? "Фото покупателей" : "Сатып алушылардың фотолары"}</strong>
                <span>{opinions.photoReviews.length}</span>
              </div>
              <div className="photo-review-track">
                {opinions.photoReviews.map((PhotoReview, Index) => (
                  <button
                    className="photo-review-card"
                    type="button"
                    key={PhotoReview.id}
                    aria-label={locale === "ru" ? `Открыть фото от ${PhotoReview.authorName}` : `${PhotoReview.authorName} фотосын ашу`}
                    onClick={() => {
                      setPhotoIndex(Index);
                      setPhotoLightboxOpen(true);
                    }}
                  >
                    <SmartImage src={PhotoReview.imageUrl} alt={PhotoReview.authorName} loading="lazy" decoding="async" />
                    <span className="photo-review-overlay" />
                    <span className="photo-review-caption">
                      <strong>{PhotoReview.authorName}</strong>
                      <span>{PhotoReview.text}</span>
                      <em>{locale === "ru" ? "Открыть фото" : "Фотоны ашу"}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ImageLightbox
        open={PhotoLightboxOpen}
        items={PhotoItems}
        activeIndex={PhotoIndex}
        closeLabel={t.nav.close}
        previousLabel={t.product.previousImage}
        nextLabel={t.product.nextImage}
        zoomLabel={locale === "ru" ? "Увеличить или уменьшить фото" : "Фотосуретті үлкейту немесе кішірейту"}
        onClose={() => setPhotoLightboxOpen(false)}
        onChange={setPhotoIndex}
      />
    </section>
  );
}
