import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bitcoinforthearts.org';
  const now = new Date();

  const routes = [
    '/',
    '/about',
    '/about/reason-for-formation',
    '/about/governance',
    '/about/leadership',
    '/about/leadership/dion-wilson',
    '/get-involved',
    '/get-involved/diy-fundraising-guide',
    '/get-involved/volunteer',
    '/get-involved/feedback',
    '/grants',
    '/grants/guidelines',
    '/grants/faq',
    '/programming',
    '/education',
    '/education/open',
    '/artists',
    '/artists/research',
    '/events',
    '/stories',
    '/donate',
    '/donate/monthly',
    '/donate/guides/life-insurance',
    '/donate/guides/securities',
    '/donate/guides/ira-qcd',
    '/donate/guides/daf',
    '/donate/guides/estate-planning',
    '/donate/guides/royalties-ip',
    '/contact',
    '/transparency',
    '/transparency/sovereign-artist-residency-proposal',
    '/privacy-policy',
    '/terms',
    '/billing',
  ];

  return routes.map((url) => ({
    url: `${baseUrl}${url}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: url === '/' ? 1 : 0.7,
  }));
}

