import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:3002';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
