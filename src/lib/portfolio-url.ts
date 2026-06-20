export function getPortfolioUrl(slug: string): string {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

  if (!rootDomain) {
    throw new Error("NEXT_PUBLIC_ROOT_DOMAIN is not configured");
  }

  // Use http for local development (localhost or lvh.me) and https for production
  const isLocal = rootDomain.includes("localhost") || rootDomain.includes("lvh.me");
  const protocol = isLocal ? "http" : "https";

  return `${protocol}://${slug}.${rootDomain}`;
}
