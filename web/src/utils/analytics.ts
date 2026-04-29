declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', event, params);
}
