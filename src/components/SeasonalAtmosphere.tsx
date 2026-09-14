import { Bell, Gift, Snowflake, Sparkles, Star, TreePine } from "lucide-react";
import { useEffect } from "react";

export function SeasonalAtmosphere() {
  useEffect(() => {
    let AnimationFrame: number | null = null;

    const Update = () => {
      const Root = document.documentElement;
      const MaximumScroll = Math.max(1, Root.scrollHeight - window.innerHeight);
      const ScrollY = window.scrollY;
      const Progress = Math.min(1, Math.max(0, ScrollY / MaximumScroll));
      const SmallShift = Math.min(120, ScrollY * 0.045);
      const MediumShift = Math.min(220, ScrollY * 0.08);
      const Rotation = Math.min(180, ScrollY * 0.04);

      Root.style.setProperty("--season-progress", Progress.toFixed(4));
      Root.style.setProperty("--season-shift-small", `${SmallShift.toFixed(2)}px`);
      Root.style.setProperty("--season-shift-small-neg", `${(-SmallShift).toFixed(2)}px`);
      Root.style.setProperty("--season-shift-medium", `${MediumShift.toFixed(2)}px`);
      Root.style.setProperty("--season-shift-medium-neg", `${(-MediumShift).toFixed(2)}px`);
      Root.style.setProperty("--season-rotation", `${Rotation.toFixed(2)}deg`);
      Root.style.setProperty("--season-rotation-neg", `${(-Rotation).toFixed(2)}deg`);
      AnimationFrame = null;
    };

    const QueueUpdate = () => {
      if (AnimationFrame === null) {
        AnimationFrame = window.requestAnimationFrame(Update);
      }
    };

    Update();
    window.addEventListener("scroll", QueueUpdate, { passive: true });
    window.addEventListener("resize", QueueUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", QueueUpdate);
      window.removeEventListener("resize", QueueUpdate);
      if (AnimationFrame !== null) {
        window.cancelAnimationFrame(AnimationFrame);
      }
    };
  }, []);

  return (
    <div className="seasonal-atmosphere" aria-hidden="true">
      <span className="seasonal-decoration decoration-snowflake decoration-one"><Snowflake /></span>
      <span className="seasonal-decoration decoration-tree decoration-two"><TreePine /></span>
      <span className="seasonal-decoration decoration-star decoration-three"><Star /></span>
      <span className="seasonal-decoration decoration-gift decoration-four"><Gift /></span>
      <span className="seasonal-decoration decoration-bell decoration-five"><Bell /></span>
      <span className="seasonal-decoration decoration-sparkle decoration-six"><Sparkles /></span>
      <span className="seasonal-ornament ornament-one"><i /></span>
      <span className="seasonal-ornament ornament-two"><i /></span>
      <span className="seasonal-ornament ornament-three"><i /></span>
      <span className="seasonal-scroll-progress"><i /></span>
      <span className="seasonal-garland">{Array.from({ length: 9 }, (_, Index) => <i key={Index} />)}</span>
    </div>
  );
}
