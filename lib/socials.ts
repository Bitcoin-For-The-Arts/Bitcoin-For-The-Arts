export type SocialLink = {
  key: 'x' | 'tiktok' | 'facebook' | 'nostr' | 'linkedin' | 'instagram';
  label: string;
  href: string;
};

function env(name: string): string | null {
  const v = process.env[name];
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed ? trimmed : null;
}

const socialLinksRaw = [
  {
    key: 'x',
    label: 'X',
    href: env('NEXT_PUBLIC_SOCIAL_X') ?? '',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    href: env('NEXT_PUBLIC_SOCIAL_TIKTOK') ?? '',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    href: env('NEXT_PUBLIC_SOCIAL_FACEBOOK') ?? '',
  },
  {
    key: 'nostr',
    label: 'Nostr',
    href: env('NEXT_PUBLIC_SOCIAL_NOSTR') ?? '',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: env('NEXT_PUBLIC_SOCIAL_LINKEDIN') ?? '',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: env('NEXT_PUBLIC_SOCIAL_INSTAGRAM') ?? '',
  },
 ] satisfies ReadonlyArray<SocialLink>;

export const socialLinks: SocialLink[] = socialLinksRaw.filter((s): s is SocialLink =>
  Boolean(s.href),
);

