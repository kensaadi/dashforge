import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import { snackbarVariants } from './snackbar.variants.js';
import {
  getSeverityClasses,
} from '../_shared/severity/severityVariants.js';
import { getDefaultSeverityIcon } from '../_shared/severity/severityIcons.js';
import type {
  SnackbarApi,
  SnackbarOptions,
  SnackbarProviderProps,
  SnackbarRecord,
} from './snackbar.types.js';

const SnackbarContext = createContext<SnackbarApi | null>(null);

/**
 * `useSnackbar()` — returns `{ enqueue, dismiss, dismissAll }`.
 *
 * Throws if called outside `<SnackbarProvider>` — silent no-op would
 * be a footgun for "Saved!" toasts that silently vanish.
 */
export function useSnackbar(): SnackbarApi {
  const ctx = useContext(SnackbarContext);
  if (ctx == null) {
    throw new Error(
      '[Snackbar] useSnackbar() must be called inside <SnackbarProvider>.'
    );
  }
  return ctx;
}

/**
 * Dashforge TW Snackbar provider — transient, stacked toast notifications.
 *
 * **Behaviour**:
 *   - `enqueue(opts)` returns the assigned `id`.
 *   - Items appear in a fixed-corner stack (`position` prop).
 *   - At most `maxVisible` (default 5) are shown — extras queue FIFO.
 *   - Each item auto-dismisses after `autoHideMs` (default 4000); set
 *     `0` for a persistent snackbar.
 *   - Re-enqueueing with the SAME `id` reuses the slot and resets the
 *     timer (de-dup pattern for repeated "Saved" toasts).
 *
 * **A11y**:
 *   - Container is an `aria-live="polite"` region (assistive techs
 *     announce new messages without stealing focus).
 *   - Severity icon is `aria-hidden` — the message text carries the
 *     semantic.
 *   - Close + action buttons are focusable via Tab; the visual stack
 *     order is the same as the announcement order.
 *
 * **Re-render contract**:
 *   - Provider re-renders ONLY when the visible set changes.
 *   - The `api` (returned by `useSnackbar()`) is stable across re-renders
 *     — `useCallback`'d with no deps, mutates a ref internally.
 *   - Consumers calling `useSnackbar()` get the same identity each time
 *     so they can safely pass `enqueue` to `useEffect` deps.
 */
export function SnackbarProvider(props: SnackbarProviderProps) {
  const {
    children,
    position = 'bottom-right',
    maxVisible = 5,
    defaults,
    slotProps,
  } = props;

  /**
   * The set of CURRENTLY-RENDERED snackbars. Extras enqueued past
   * `maxVisible` wait in `queueRef` until a slot frees up.
   */
  const [visible, setVisible] = useState<SnackbarRecord[]>([]);
  const queueRef = useRef<SnackbarRecord[]>([]);

  /** Monotonic id seed + tick. */
  const idSeqRef = useRef(0);
  const tickSeqRef = useRef(0);

  /** Map<id, timeoutId> for auto-dismiss timers — cleared on dismiss/replace. */
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  /** Stable refs so `api` callbacks don't need to depend on state. */
  const maxVisibleRef = useRef(maxVisible);
  maxVisibleRef.current = maxVisible;
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const clearTimer = (id: string) => {
    const t = timersRef.current.get(id);
    if (t != null) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  };

  /**
   * `dismiss` — remove a snackbar, then attempt to promote a queued
   * item into the freed slot.
   */
  const dismiss = useCallback((id: string) => {
    clearTimer(id);
    setVisible((curr) => {
      const next = curr.filter((s) => s.id !== id);
      // Promote one from the queue if there's room.
      if (next.length < maxVisibleRef.current && queueRef.current.length > 0) {
        const promoted = queueRef.current.shift();
        if (promoted != null) {
          scheduleAutoDismiss(promoted);
          return [...next, promoted];
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Schedule the auto-dismiss timeout for a given record (if its
   * `autoHideMs > 0`). Stable ref so it can be invoked from inside
   * `dismiss` without a circular dep.
   */
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;
  const scheduleAutoDismiss = useCallback((rec: SnackbarRecord) => {
    const ms = rec.autoHideMs ?? defaultsRef.current?.autoHideMs ?? 4000;
    if (ms <= 0) return;
    clearTimer(rec.id);
    const handle = setTimeout(() => dismissRef.current(rec.id), ms);
    timersRef.current.set(rec.id, handle);
  }, []);

  /**
   * `enqueue` — show a new snackbar.
   *
   * De-dup contract: if `options.id` matches a CURRENTLY-VISIBLE or
   * CURRENTLY-QUEUED entry, the existing entry's content is updated
   * AND its timer is reset, instead of appending a duplicate.
   */
  const enqueue = useCallback((options: SnackbarOptions): string => {
    const id = options.id ?? `sb-${++idSeqRef.current}`;
    const tick = ++tickSeqRef.current;
    const rec: SnackbarRecord = {
      ...defaultsRef.current,
      ...options,
      id,
      tick,
    };
    // Reset timer if id already exists (de-dup).
    clearTimer(id);

    setVisible((curr) => {
      const idx = curr.findIndex((s) => s.id === id);
      if (idx >= 0) {
        // Replace in-place, reset timer.
        const next = [...curr];
        next[idx] = rec;
        scheduleAutoDismiss(rec);
        return next;
      }
      // Drop the same-id entry from the queue if it's waiting.
      queueRef.current = queueRef.current.filter((s) => s.id !== id);
      if (curr.length < maxVisibleRef.current) {
        scheduleAutoDismiss(rec);
        return [...curr, rec];
      }
      // Stack is full — queue and wait.
      queueRef.current.push(rec);
      return curr;
    });
    return id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** `dismissAll` — clear everything (visible + queued + timers). */
  const dismissAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    queueRef.current = [];
    setVisible([]);
  }, []);

  // Clean up any straggler timers on unmount.
  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    },
    []
  );

  const api = useMemo<SnackbarApi>(
    () => ({ enqueue, dismiss, dismissAll }),
    [enqueue, dismiss, dismissAll]
  );

  const v = snackbarVariants({ position });

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      <div
        className={cn(v.container(), slotProps?.container?.className)}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="false"
      >
        {visible.map((rec) => {
          const sev = rec.severity ?? defaults?.severity ?? 'info';
          const variant = rec.variant ?? defaults?.variant ?? 'standard';
          const showClose =
            rec.showClose ?? defaults?.showClose ?? true;
          const itemClasses = snackbarVariants({ position });
          // Severity color classes — sourced from the shared 3×4 matrix
          // (`_shared/severity/`), same as Alert. Keeps the two
          // components visually in lockstep.
          const severityClasses = getSeverityClasses(variant, sev);
          // Icon resolution — same tristate as Alert:
          //   undefined → default per-severity SVG (shared with Alert)
          //   ReactNode → consumer's icon
          //   false     → no icon
          const renderedIcon =
            rec.icon === false
              ? null
              : rec.icon !== undefined
                ? rec.icon
                : getDefaultSeverityIcon(sev);
          return (
            <div
              key={rec.id}
              data-state="entered"
              data-tick={rec.tick}
              className={cn(
                itemClasses.item(),
                severityClasses.surface,
                severityClasses.border,
                slotProps?.item?.className
              )}
            >
              {renderedIcon !== null && (
                <span
                  className={cn(
                    itemClasses.icon(),
                    severityClasses.icon,
                    slotProps?.icon?.className
                  )}
                >
                  {renderedIcon}
                </span>
              )}
              <div
                className={cn(
                  itemClasses.message(),
                  slotProps?.message?.className
                )}
              >
                {rec.message}
              </div>
              {rec.action != null && (
                <button
                  type="button"
                  onClick={() => {
                    rec.action?.onClick();
                    dismiss(rec.id);
                  }}
                  className={cn(
                    itemClasses.action(),
                    slotProps?.action?.className
                  )}
                >
                  {rec.action.label}
                </button>
              )}
              {showClose && (
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(rec.id)}
                  className={cn(
                    itemClasses.closeButton(),
                    slotProps?.closeButton?.className
                  )}
                >
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 6 8 8M14 6l-8 8" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
}
