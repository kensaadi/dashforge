/**
 * SSR-safe DOM utilities
 * Prevents errors during pre-rendering when window/document are unavailable
 */

export const isBrowser = typeof window !== 'undefined';

export const scrollTo = (options: ScrollToOptions): void => {
  if (isBrowser) {
    window.scrollTo(options);
  }
};

export const scrollToTop = (): void => {
  if (isBrowser) {
    window.scrollTo(0, 0);
  }
};

export const matchMedia = (
  query: string
): MediaQueryList | { matches: boolean } => {
  if (isBrowser) {
    return window.matchMedia(query);
  }
  return { matches: false };
};

export const getElementById = (id: string): HTMLElement | null => {
  if (isBrowser) {
    return document.getElementById(id);
  }
  return null;
};

export const getScrollPosition = () => {
  if (!isBrowser) {
    return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
  }
  return {
    scrollTop: window.scrollY || document.documentElement.scrollTop,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: window.innerHeight,
  };
};

export const addEventListener = (
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): (() => void) => {
  if (!isBrowser) {
    return () => {}; // noop cleanup
  }
  window.addEventListener(event, handler, options);
  return () => window.removeEventListener(event, handler);
};
