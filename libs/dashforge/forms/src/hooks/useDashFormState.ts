import {
  useFormState,
  type FieldValues,
  type UseFormStateProps,
  type UseFormStateReturn,
} from 'react-hook-form';
import { useDashFormContext } from '../core/useDashFormContext';

/**
 * Options accepted by `useDashFormState` — mirror React Hook Form's
 * `UseFormStateProps` minus `control` (Dashforge supplies it from the
 * ambient `DashFormContext`).
 */
export type UseDashFormStateProps<TFieldValues extends FieldValues = FieldValues> =
  Omit<UseFormStateProps<TFieldValues>, 'control'>;

/**
 * Subscribe THIS component to React Hook Form's form-level state
 * (`isDirty`, `isValid`, `isSubmitting`, `isSubmitted`, `isValidating`,
 * `submitCount`, `errors`, `dirtyFields`, `touchedFields`,
 * `defaultValues`, `disabled`).
 *
 * ## Why this hook exists
 *
 * `useDashFormContext().rhf.formState` returns the raw RHF proxy. RHF
 * v7 subscribes proxy reads **at the component that called `useForm`**
 * — inside Dashforge that's `<DashFormProvider>`, not your component.
 * So reading `rhf.formState.isDirty` from a component nested under the
 * provider returns the current value but does NOT re-render your
 * component when `isDirty` changes. The Save button gated on
 * `!isDirty` stays stuck.
 *
 * `useDashFormState()` is a thin wrapper over RHF's `useFormState({
 * control })` that scopes the subscription to the calling component,
 * so any property you destructure re-renders this component correctly
 * on change.
 *
 * ## Companion to `useDashFieldMeta`
 *
 * - `useDashFieldMeta(name)` — **per-field** subscription
 *   (`value` / `error` / `touched` / `dirty` / `submitCount` /
 *   `allowAutoError`). What most field components use internally.
 * - `useDashFormState()` — **form-level** subscription (aggregates
 *   like `isDirty` / `isValid` / `isSubmitting`). What consumer code
 *   uses to gate submit buttons, unsaved-changes guards, spinners,
 *   validation banners.
 *
 * @example Save button gated on `isDirty`
 * ```tsx
 * function SaveButton() {
 *   const { isDirty, isSubmitting } = useDashFormState();
 *   return (
 *     <Button type="submit" disabled={!isDirty} loading={isSubmitting}>
 *       Save
 *     </Button>
 *   );
 * }
 * ```
 *
 * @example Subscribe to a specific field only (perf)
 * ```tsx
 * // Re-renders only when `email` is validating (not on every keystroke).
 * const { isValidating } = useDashFormState({ name: 'email' });
 * ```
 *
 * @param props - Optional `UseFormStateProps` minus `control`
 *   (e.g. `{ name }` to scope to specific field(s), `{ exact: true }`,
 *   `{ disabled }`).
 * @returns The RHF `UseFormStateReturn` — same shape as
 *   `rhf.formState`, with reactive subscriptions scoped to this
 *   component.
 * @throws If called outside a `<DashFormProvider>`.
 */
export function useDashFormState<
  TFieldValues extends FieldValues = FieldValues,
>(
  props?: UseDashFormStateProps<TFieldValues>
): UseFormStateReturn<TFieldValues> {
  const { rhf } = useDashFormContext<TFieldValues>();
  return useFormState<TFieldValues>({
    control: rhf.control,
    ...(props ?? {}),
  });
}
