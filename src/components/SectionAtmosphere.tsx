import { Star, TreePine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SectionAtmosphereVariant = "hero" | "band" | "section" | "info" | "faq" | "product";

type SectionAtmosphereProps = {
  variant?: SectionAtmosphereVariant;
};

function CandyCaneIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M31.5 39.5 18 26V13.5C18 7.7 22.7 3 28.5 3S39 7.7 39 13.5 34.3 24 28.5 24H25" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 12 7 4m-7 4 7 4m3-19 7 4m-1 8 2 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function StockingIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M16 4h18v18c0 5 3 8 8 10-3 8-9 12-18 12-7 0-13-3-17-8 7-4 9-9 9-16V4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 11h22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SectionAtmosphere({ variant = "section" }: SectionAtmosphereProps) {
  const RootReference = useRef<HTMLDivElement | null>(null);
  const [IsVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const Element = RootReference.current;
    if (!Element) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const Observer = new IntersectionObserver(
      ([Entry]) => setIsVisible(Entry.isIntersecting),
      {
        rootMargin: "120px 0px 120px 0px",
        threshold: 0.02
      }
    );

    Observer.observe(Element);
    return () => Observer.disconnect();
  }, []);

  return (
    <div
      ref={RootReference}
      className={IsVisible ? `section-atmosphere section-atmosphere-${variant} is-visible` : `section-atmosphere section-atmosphere-${variant}`}
      aria-hidden="true"
    >
      <span className="section-atmosphere-item atmosphere-tree"><TreePine /></span>
      <span className="section-atmosphere-item atmosphere-star"><Star /></span>
      <span className="section-atmosphere-item atmosphere-candy"><CandyCaneIcon /></span>
      <span className="section-atmosphere-item atmosphere-stocking"><StockingIcon /></span>
      <span className="section-atmosphere-item atmosphere-bauble"><i /></span>
    </div>
  );
}
