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
import { confirmDialogVariants } from './confirmDialog.variants.js';
import type {
  ConfirmDialogProviderProps,
  ConfirmFn,
  ConfirmOptions,
  ConfirmDialogSlotProps,
} from './confirmDialog.types.js';

/**
 * Internal queue entry — the live request being shown PLUS the resolver
 * for its promise.
 */
interface ActiveRequest {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * `useConfirm()` — returns the imperative `confirm()` function.
 *
 * Throws if called outside a `<ConfirmDialogProvider>`. The thrown error
 * tells the developer exactly what to do — no silent no-op (silently
 * resolving `false` would be a footgun for destructive actions).
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (ctx == null) {
    throw new Error(
      '[ConfirmDialog] useConfirm() must be called inside <ConfirmDialogProvider>.'
    );
  }
  return ctx;
}

/**
 * Dashforge TW ConfirmDialog provider.
 *
 * Imperative confirmation modal built on the native HTML `<dialog>`
 * element + `showModal()`. Why native:
 *
 *  1. **AAA-grade a11y for free** — browsers implement focus trap,
 *     Escape key, inert background, and `aria-modal` semantics natively.
 *  2. **Zero new deps** — no `@radix-ui/react-dialog` or Aria stack.
 *  3. **Smaller bundle** — ~1 KB of logic vs. ~25 KB for Aria Dialog.
 *
 * **Behaviour**:
 *   - `confirm(opts)` returns a `Promise<boolean>`.
 *   - Backdrop click resolves `false` (unless `disableBackdropClose`).
 *   - Escape key resolves `false` (unless `disableEscapeClose`).
 *   - Cancel button resolves `false`.
 *   - Confirm button resolves `true`.
 *   - At most ONE dialog open at a time — concurrent `confirm()` calls
 *     queue and fire FIFO (so a destructive action can't accidentally
 *     race a benign one).
 *
 * **A11y**:
 *   - `<dialog>` ⇒ implicit `role="dialog"` + `aria-modal="true"`.
 *   - `aria-labelledby` wires the title id to the dialog.
 *   - Focus is auto-trapped by `showModal()`.
 *   - First focusable element receives focus on open (browser-managed).
 */
export function ConfirmDialogProvider(props: ConfirmDialogProviderProps) {
  const { children, defaults, slotProps: providerSlotProps, severity } = props;

  const [active, setActive] = useState<ActiveRequest | null>(null);
  // FIFO queue of pending requests. We process them strictly in order
  // so a quick `confirm(A); confirm(B)` keeps the user's mental model
  // (A first, then B) instead of dropping/overlapping.
  const queueRef = useRef<ActiveRequest[]>([]);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = `confirm-dialog-title`;

  /** Drain one item from the queue into the active slot, if any. */
  const advanceQueue = useCallback(() => {
    const next = queueRef.current.shift();
    setActive(next ?? null);
  }, []);

  /**
   * Public API — enqueue a confirmation and return a promise that
   * resolves when the user picks an option (or the dialog is dismissed).
   *
   * Implementation note: we ALWAYS push the new request into
   * `queueRef.current`, then ask React to advance — `setActive` runs
   * with a functional updater, so it sees the latest `active` even when
   * two `confirm()` calls fire back-to-back in the same tick (before
   * a re-render). This is what makes the FIFO contract reliable under
   * synchronous bursts.
   */
  const confirm = useCallback<ConfirmFn>(
    (options) => {
      return new Promise<boolean>((resolve) => {
        const merged: ConfirmOptions = { ...defaults, ...options };
        const entry: ActiveRequest = { options: merged, resolve };
        queueRef.current.push(entry);
        setActive((curr) => curr ?? queueRef.current.shift() ?? null);
      });
    },
    [defaults]
  );

  // Open / close the native dialog in sync with `active`.
  // `showModal()` MUST be called from a side effect (post-render) so
  // React has finished mounting the `<dialog>` element.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (active != null && !dlg.open) {
      dlg.showModal();
    } else if (active == null && dlg.open) {
      dlg.close();
    }
  }, [active]);

  /** Resolve the current promise with `value` and pop the next request. */
  const finish = useCallback(
    (value: boolean) => {
      if (active == null) return;
      active.resolve(value);
      advanceQueue();
    },
    [active, advanceQueue]
  );

  /**
   * Wire the native `close` event — fires for Escape OR for `dialog.close()`.
   * We need this so an Escape press (handled internally by the browser
   * without going through our React handlers) still resolves the promise.
   */
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handler = () => {
      if (active == null) return;
      // Browser closed (Escape). If consumer disabled Esc, re-open.
      if (active.options.disableEscapeClose) {
        dlg.showModal();
        return;
      }
      finish(false);
    };
    dlg.addEventListener('close', handler);
    return () => dlg.removeEventListener('close', handler);
  }, [active, finish]);

  /**
   * Backdrop click ⇒ resolve false. The native `<dialog>` element
   * receives the click event when the user clicks OUTSIDE the dialog
   * body (the click lands on the `::backdrop` pseudo) — we detect
   * that by checking the event target equals the dialog itself.
   */
  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (active == null) return;
    if (active.options.disableBackdropClose) return;
    if (event.target === event.currentTarget) {
      finish(false);
    }
  };

  // Memoize the context value so consumers that re-render for unrelated
  // reasons don't trigger the entire provider subtree.
  const ctxValue = useMemo<ConfirmFn>(() => confirm, [confirm]);

  const opts = active?.options;
  const mergedSlotProps: ConfirmDialogSlotProps = {
    ...providerSlotProps,
    ...opts?.slotProps,
  };
  const v = confirmDialogVariants({
    severity: opts?.severity ?? severity ?? 'info',
  });

  return (
    <ConfirmContext.Provider value={ctxValue}>
      {children}
      {/*
        The native <dialog> is ALWAYS mounted (even when `active` is null)
        so the ref is stable and the open/close effect can run on the
        same DOM node across requests. The contents render conditionally.
      */}
      <dialog
        ref={dialogRef}
        aria-labelledby={opts?.title != null ? titleId : undefined}
        onClick={handleDialogClick}
        className={cn(
          v.backdrop(),
          v.dialog(),
          mergedSlotProps.backdrop?.className,
          mergedSlotProps.dialog?.className
        )}
      >
        {opts != null && (
          <>
            {opts.title != null && (
              <h2
                id={titleId}
                className={cn(v.title(), mergedSlotProps.title?.className)}
              >
                {opts.title}
              </h2>
            )}
            {opts.body != null && (
              <div className={cn(v.body(), mergedSlotProps.body?.className)}>
                {opts.body}
              </div>
            )}
            <div
              className={cn(
                v.actions(),
                mergedSlotProps.actions?.className
              )}
            >
              <button
                type="button"
                onClick={() => finish(false)}
                className={cn(
                  v.cancelButton(),
                  mergedSlotProps.cancelButton?.className
                )}
              >
                {opts.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                autoFocus
                className={cn(
                  v.confirmButton(),
                  mergedSlotProps.confirmButton?.className
                )}
              >
                {opts.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}
