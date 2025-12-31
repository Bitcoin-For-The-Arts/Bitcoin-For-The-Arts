import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bitcoinforthearts.org';
  const now = new Date();

  const routes = [
    '/',
    '/about',
    '/get-involved',
    '/get-involved/diy-fundraising-guide',
    '/grants',
    '/programming',
    '/artists',
    '/events',
    '/stories',
    '/donate',
    '/contact',
    '/privacy-policy',
  ];

  return routes.map((url) => ({
    url: `${baseUrl}${url}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: url === '/' ? 1 : 0.7,
  }));
}

