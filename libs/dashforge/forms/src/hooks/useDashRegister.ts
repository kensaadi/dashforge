import { useEffect } from 'react';
import type {
  RegisterOptions,
  FieldPath,
  FieldValues,
  UseFormRegisterReturn,
} from 'react-hook-form';
import { useDashFormContext } from '../core/useDashFormContext';

/**
 * Result returned by useDashRegister hook.
 *
 * @template TFieldValues - Form field values type
 */
export interface UseDashRegisterResult<
  TFieldValues extends FieldValues = FieldValues
> {
  /**
   * React Hook Form register result.
   * Spread this onto your input element: `{...register}`
   */
  register: UseFormRegisterReturn<FieldPath<TFieldValues>>;

  /**
   * The field name that was registered.
   * Useful for debugging or building custom components.
   */
  name: string;
}

/**
 * Hook to register a form field with both RHF and the Engine adapter.
 *
 * **Phase 1 Implementation:**
 * - Calls rhf.register() to register with React Hook Form
 * - Calls adapter.registerField() / unregisterField() for lifecycle tracking
 * - Intercepts onChange to sync values to Engine (unidirectional: RHF → Engine)
 * - Cleanup on unmount
 *
 * **Future Phases:**
 * - Phase 2: Set up subscription to Engine node changes (Engine → RHF)
 * - Phase 3: Integrate with reaction system
 * - Phase 4: Add async validation support
 *
 * @template TFieldValues - Form field values type
 * @param name - Field name to register
 * @param options - React Hook Form validation options
 * @returns Object with register props and field name
 *
 * @example
 * ```tsx
 * function EmailField() {
 *   const { register, name } = useDashRegister('email', {
 *     required: 'Email is required',
 *     pattern: {
 *       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
 *       message: 'Invalid email address',
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <label htmlFor={name}>Email</label>
 *       <input id={name} type="email" {...register} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function CheckboxField() {
 *   const { register } = useDashRegister('acceptTerms', {
 *     required: 'You must accept terms',
 *   });
 *
 *   return (
 *     <label>
 *       <input type="checkbox" {...register} />
 *       I accept the terms
 *     </label>
 *   );
 * }
 * ```
 */
export function useDashRegister<TFieldValues extends FieldValues = FieldValues>(
  name: FieldPath<TFieldValues>,
  options?: RegisterOptions<TFieldValues>
): UseDashRegisterResult<TFieldValues> {
  const { rhf, adapter, debug } = useDashFormContext<TFieldValues>();

  // Register with React Hook Form
  // This returns the props to spread on the input element
  const rhfRegister = rhf.register(name, options);

  // Register/unregister with adapter on mount/unmount
  useEffect(() => {
    if (debug) {
      console.log(`[useDashRegister] Registering field: ${String(name)}`, {
        options,
      });
    }

    // Register field with adapter
    adapter.registerField(name);

    // Cleanup: unregister when component unmounts
    return () => {
      if (debug) {
        console.log(`[useDashRegister] Unregistering field: ${String(name)}`);
      }
      adapter.unregisterField(name);
    };
  }, [name, adapter, debug, options]);

  // Intercept onChange to sync value to Engine
  const handleChange: typeof rhfRegister.onChange = async (event) => {
    // Call original RHF onChange first to update RHF state
    const result = await rhfRegister.onChange(event);

    // Extract value from event or use event directly if not a DOM event
    const value =
      event && typeof event === 'object' && 'target' in event
        ? (event as { target: { value: unknown } }).target.value
        : event;

    // Sync to Engine (unidirectional: RHF → Engine)
    adapter.syncValueToEngine(name, value);

    return result;
  };

  return {
    register: {
      ...rhfRegister,
      onChange: handleChange,
    },
    name: String(name),
  };
}
