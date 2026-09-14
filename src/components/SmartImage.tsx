import { ImgHTMLAttributes, useEffect, useMemo, useState } from "react";
import { resolvePublicAsset } from "../utils/assets";

type SmartImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export function SmartImage({ src, fallbackSrc = "/tree-placeholder.svg", onError, ...Props }: SmartImageProps) {
  const ResolvedSource = useMemo(() => resolvePublicAsset(src), [src]);
  const ResolvedFallback = useMemo(() => resolvePublicAsset(fallbackSrc), [fallbackSrc]);
  const [CurrentSrc, setCurrentSrc] = useState(ResolvedSource);

  useEffect(() => {
    setCurrentSrc(ResolvedSource);
  }, [ResolvedSource]);

  return (
    <img
      {...Props}
      src={CurrentSrc || ResolvedFallback}
      onError={(Event) => {
        if (CurrentSrc !== ResolvedFallback) {
          setCurrentSrc(ResolvedFallback);
        }
        onError?.(Event);
      }}
    />
  );
}
