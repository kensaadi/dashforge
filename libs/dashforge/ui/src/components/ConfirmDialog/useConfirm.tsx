import { useContext } from 'react';
import { ConfirmDialogContext } from './ConfirmDialogProvider';
import type { ConfirmOptions, ConfirmResult } from './types';

/**
 * useConfirm() hook for imperative confirmation dialogs.
 *
 * Returns a function that opens a confirmation dialog and returns a promise
 * that resolves to a semantic ConfirmResult (discriminated union).
 *
 * Result types:
 * - `{ status: 'confirmed' }` → User clicked confirm button
 * - `{ status: 'cancelled', reason: ... }` → User cancelled (cancel-button, backdrop, escape-key, provider-unmount)
 * - `{ status: 'blocked', reason: 'reentrant-call' }` → Re-entrant call was blocked
 *
 * ⚠️ RE-ENTRANCY WARNING:
 * Only ONE confirm dialog can be open at a time.
 * If confirm() is called while a dialog is already pending:
 * - New call returns `{ status: 'blocked', reason: 'reentrant-call' }` immediately
 * - Existing dialog remains open (not replaced)
 * - Dev mode: console warning is logged
 *
 * Wait for the current dialog to close before opening another:
 *
 * @example
 * // ❌ BAD: Rapid calls (second call blocked)
 * confirm({ title: 'First?' });
 * const result = confirm({ title: 'Second?' }); // Returns blocked immediately
 *
 * @example
 * // ✅ GOOD: Sequential calls
 * const first = await confirm({ title: 'First?' });
 * if (first.status === 'confirmed') {
 *   const second = await confirm({ title: 'Second?' });
 * }
 *
 * @example
 * // Basic usage with semantic result
 * const confirm = useConfirm();
 *
 * const handleDelete = async () => {
 *   const result = await confirm({
 *     title: 'Delete User',
 *     description: 'This action cannot be undone.',
 *     confirmText: 'Delete',
 *     confirmButtonProps: { color: 'error' }
 *   });
 *
 *   if (result.status === 'confirmed') {
 *     await deleteUser();
 *   } else if (result.status === 'cancelled') {
 *     console.log('Cancelled via:', result.reason);
 *   }
 * };
 *
 * @throws {Error} If called outside ConfirmDialogProvider
 * @returns Function that opens confirmation dialog and returns promise with semantic result
 */
export function useConfirm(): (
  options: ConfirmOptions
) => Promise<ConfirmResult> {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      'useConfirm must be used within ConfirmDialogProvider. ' +
        'Wrap your app root with <ConfirmDialogProvider>.'
    );
  }

  return context.confirm;
}
