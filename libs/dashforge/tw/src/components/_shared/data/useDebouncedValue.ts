import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of `value` — only updates after `delayMs`
 * of no further changes. Used by the search input so we don't re-filter
 * the entire row set on every keystroke.
 *
 * `delayMs <= 0` short-circuits to the input value (no debounce —
 * useful for tests).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    if (delayMs <= 0) {
      setDebounced(value);
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
