import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useRouteScroll() {
  const Location = useLocation();

  useEffect(() => {
    if (!Location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    let FrameId = 0;
    let Attempts = 0;
    const TargetId = decodeURIComponent(Location.hash.slice(1));

    const ScrollToTarget = () => {
      const Target = document.getElementById(TargetId);
      if (Target) {
        Target.scrollIntoView({ block: "start", behavior: "smooth" });
        return;
      }

      Attempts += 1;
      if (Attempts < 30) {
        FrameId = window.requestAnimationFrame(ScrollToTarget);
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    FrameId = window.requestAnimationFrame(ScrollToTarget);
    return () => window.cancelAnimationFrame(FrameId);
  }, [Location.pathname, Location.hash]);
}
