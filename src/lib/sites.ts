export interface Site {
  id: string;
  domain: string;
  name: string;
  icon: string; // SVG icon or brand identifier
  enabled: boolean;
}

export const PRESET_SITES: Site[] = [
  {
    id: 'instagram',
    domain: 'instagram.com',
    name: 'Instagram',
    icon: 'instagram',
    enabled: true,
  },
  {
    id: 'youtube',
    domain: 'youtube.com',
    name: 'YouTube',
    icon: 'youtube',
    enabled: true,
  },
  {
    id: 'twitter',
    domain: 'x.com',
    name: 'X (Twitter)',
    icon: 'twitter',
    enabled: true,
  },
  {
    id: 'reddit',
    domain: 'reddit.com',
    name: 'Reddit',
    icon: 'reddit',
    enabled: true,
  },
  {
    id: 'netflix',
    domain: 'netflix.com',
    name: 'Netflix',
    icon: 'netflix',
    enabled: false,
  },
  {
    id: 'facebook',
    domain: 'facebook.com',
    name: 'Facebook',
    icon: 'facebook',
    enabled: false,
  },
  {
    id: 'tiktok',
    domain: 'tiktok.com',
    name: 'TikTok',
    icon: 'tiktok',
    enabled: false,
  },
];

export function cleanDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  try {
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = 'https://' + domain;
    }
    const url = new URL(domain);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return input.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

export async function requestSitePermission(domain: string): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.permissions) {
    return true;
  }
  const origins = [
    `*://*.${domain}/*`,
    `*://${domain}/*`
  ];
  try {
    const granted = await chrome.permissions.request({ origins });
    return granted;
  } catch (err) {
    console.error('Failed to request host permission:', err);
    return false;
  }
}
