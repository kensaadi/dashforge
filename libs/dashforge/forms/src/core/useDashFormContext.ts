import { useContext } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { DashFormContextValue } from './form.types';
import { InternalDashFormContext } from './DashFormProvider';

/**
 * Hook to access DashForm context.
 * Must be used within a DashFormProvider.
 *
 * Provides access to:
 * - `engine`: The Dashforge Engine instance
 * - `rhf`: React Hook Form methods (register, handleSubmit, formState, etc.)
 * - `adapter`: Bridge between RHF and Engine
 * - `debug`: Debug mode flag
 *
 * @template TFieldValues - Form field values type
 * @throws Error if used outside DashFormProvider
 *
 * @example
 * ```tsx
 * function MyFormField() {
 *   const { rhf, adapter, debug } = useDashFormContext();
 *
 *   const { register } = rhf;
 *   const registeredFields = adapter.getRegisteredFields();
 *
 *   if (debug) {
 *     console.log('Registered fields:', registeredFields);
 *   }
 *
 *   return <input {...register('fieldName')} />;
 * }
 * ```
 */
export function useDashFormContext<
  TFieldValues extends FieldValues = FieldValues
>(): DashFormContextValue<TFieldValues> {
  const context = useContext(InternalDashFormContext);

  if (!context) {
    throw new Error(
      'useDashFormContext must be used within a DashFormProvider. ' +
        'Make sure to wrap your component with <DashFormProvider> or <DashForm>.'
    );
  }

  return context as DashFormContextValue<TFieldValues>;
}
