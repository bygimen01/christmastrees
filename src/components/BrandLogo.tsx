import { shopConfig } from "../config/shopConfig";
import { resolvePublicAsset } from "../utils/assets";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <img
      className={className ? `brand-logo ${className}` : "brand-logo"}
      src={resolvePublicAsset(shopConfig.brand.logo)}
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
    />
  );
}
