export function resolvePublicAsset(Source?: string) {
  if (!Source) {
    return Source;
  }

  if (/^(https?:|data:|blob:)/i.test(Source)) {
    return Source;
  }

  const BaseUrl = import.meta.env.BASE_URL || "/";
  const NormalizedBase = BaseUrl.endsWith("/") ? BaseUrl : `${BaseUrl}/`;

  if (Source.startsWith(NormalizedBase)) {
    return Source;
  }

  if (Source.startsWith("/")) {
    return `${NormalizedBase}${Source.replace(/^\/+/, "")}`;
  }

  return Source;
}
