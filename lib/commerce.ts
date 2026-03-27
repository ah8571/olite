const DEFAULT_RELEASES_URL = "https://github.com/ah8571/olite/releases";
const DEFAULT_WAITLIST_EMAIL = "mailto:hello@olite.dev?subject=Olite%20desktop%20beta%20interest";
const DEFAULT_EARLY_ACCESS_EMAIL = "mailto:hello@olite.dev?subject=Olite%20CLI%20or%20desktop%20early%20access";

function normalizeUrl(value: string | undefined, fallback?: string) {
  const normalized = value?.trim();

  if (normalized) {
    return normalized;
  }

  if (fallback) {
    return fallback;
  }

  return "";
}

export type CommerceConfig = {
  releasesUrl: string;
  desktopDownloadUrl: string;
  desktopWaitlistUrl: string;
  earlyAccessUrl: string;
  monthlyCheckoutUrl?: string;
  yearlyCheckoutUrl?: string;
  hasCheckout: boolean;
  hasDesktopDownload: boolean;
};

export function getCommerceConfig(): CommerceConfig {
  const releasesUrl = normalizeUrl(process.env.NEXT_PUBLIC_OLITE_RELEASES_URL, DEFAULT_RELEASES_URL);
  const desktopDownloadUrl = normalizeUrl(process.env.NEXT_PUBLIC_OLITE_DESKTOP_DOWNLOAD_URL, releasesUrl);
  const desktopWaitlistUrl = normalizeUrl(process.env.NEXT_PUBLIC_OLITE_DESKTOP_WAITLIST_URL, DEFAULT_WAITLIST_EMAIL);
  const earlyAccessUrl = normalizeUrl(process.env.NEXT_PUBLIC_OLITE_EARLY_ACCESS_URL, DEFAULT_EARLY_ACCESS_EMAIL);
  const monthlyCheckoutUrl = normalizeUrl(process.env.NEXT_PUBLIC_OLITE_LS_MONTHLY_URL) || undefined;
  const yearlyCheckoutUrl = normalizeUrl(process.env.NEXT_PUBLIC_OLITE_LS_YEARLY_URL) || undefined;

  return {
    releasesUrl,
    desktopDownloadUrl,
    desktopWaitlistUrl,
    earlyAccessUrl,
    monthlyCheckoutUrl,
    yearlyCheckoutUrl,
    hasCheckout: Boolean(monthlyCheckoutUrl || yearlyCheckoutUrl),
    hasDesktopDownload: desktopDownloadUrl !== releasesUrl || Boolean(process.env.NEXT_PUBLIC_OLITE_DESKTOP_DOWNLOAD_URL?.trim())
  };
}
