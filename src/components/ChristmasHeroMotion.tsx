import { Bell, Gift, Snowflake, Sparkles, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ChristmasHeroMotion() {
  const RootRef = useRef<HTMLDivElement | null>(null);
  const [Active, setActive] = useState(true);

  useEffect(() => {
    const Root = RootRef.current;
    if (!Root) {
      return;
    }

    const Observer = new IntersectionObserver(
      ([Entry]) => setActive(Entry.isIntersecting),
      { threshold: 0.01, rootMargin: "120px 0px 120px 0px" }
    );

    Observer.observe(Root);

    let FrameId = 0;
    const FinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const HandlePointerMove = (Event: PointerEvent) => {
      if (!FinePointer || !Active || document.hidden) {
        return;
      }

      if (FrameId) {
        window.cancelAnimationFrame(FrameId);
      }

      FrameId = window.requestAnimationFrame(() => {
        const Bounds = Root.getBoundingClientRect();
        const RelativeX = Math.max(0, Math.min(1, (Event.clientX - Bounds.left) / Math.max(1, Bounds.width)));
        const RelativeY = Math.max(0, Math.min(1, (Event.clientY - Bounds.top) / Math.max(1, Bounds.height)));
        Root.style.setProperty("--HeroParallaxX", `${(RelativeX - 0.5) * 12}px`);
        Root.style.setProperty("--HeroParallaxY", `${(RelativeY - 0.5) * 9}px`);
        FrameId = 0;
      });
    };

    const HandlePointerLeave = () => {
      Root.style.setProperty("--HeroParallaxX", "0px");
      Root.style.setProperty("--HeroParallaxY", "0px");
    };

    if (FinePointer) {
      Root.addEventListener("pointermove", HandlePointerMove, { passive: true });
      Root.addEventListener("pointerleave", HandlePointerLeave, { passive: true });
    }

    return () => {
      Observer.disconnect();
      if (FrameId) {
        window.cancelAnimationFrame(FrameId);
      }
      if (FinePointer) {
        Root.removeEventListener("pointermove", HandlePointerMove);
        Root.removeEventListener("pointerleave", HandlePointerLeave);
      }
    };
  }, [Active]);

  return (
    <div ref={RootRef} className={Active ? "christmas-hero-motion is-active" : "christmas-hero-motion"} aria-hidden="true">
      <span className="christmas-orbit christmas-orbit-primary">
        <i className="christmas-orbit-node node-star"><Star size={20} strokeWidth={1.8} /></i>
        <i className="christmas-orbit-node node-gift"><Gift size={19} strokeWidth={1.8} /></i>
      </span>
      <span className="christmas-orbit christmas-orbit-secondary">
        <i className="christmas-orbit-node node-bell"><Bell size={18} strokeWidth={1.8} /></i>
        <i className="christmas-orbit-node node-snow"><Snowflake size={18} strokeWidth={1.8} /></i>
      </span>
      <span className="christmas-spark sparkle-one"><Sparkles size={22} strokeWidth={1.8} /></span>
      <span className="christmas-spark sparkle-two"><Sparkles size={17} strokeWidth={1.8} /></span>
      <span className="christmas-bauble christmas-bauble-one"><i /></span>
      <span className="christmas-bauble christmas-bauble-two"><i /></span>
    </div>
  );
}
