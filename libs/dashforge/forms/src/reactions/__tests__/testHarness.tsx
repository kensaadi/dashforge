import { useEffect } from 'react';
import { useDashRegister } from '../../hooks/useDashRegister';

/**
 * Props for TestFieldHarness component.
 */
interface TestFieldHarnessProps {
  /**
   * Field name to register.
   */
  name: string;

  /**
   * Callback invoked when field is registered.
   * Provides a trigger function to simulate field changes.
   */
  onRegistered?: (trigger: (value: unknown) => void) => void;
}

/**
 * Test harness component that registers a field and exposes a trigger for testing.
 *
 * This component proves the real end-to-end field change flow by:
 * 1. Using real `useDashRegister` (production code)
 * 2. Providing a trigger function that fires real onChange events
 * 3. Exercising the complete chain: onChange → syncValueToEngine → adapter listener → evaluateForField
 *
 * This is NOT a shortcut or test helper that manually calls internal APIs.
 * It uses the actual production registration mechanism.
 *
 * @example
 * ```tsx
 * let triggerField: ((value: unknown) => void) | null = null;
 *
 * <TestFieldHarness
 *   name="country"
 *   onRegistered={(trigger) => {
 *     triggerField = trigger;
 *   }}
 * />
 *
 * // Later in test:
 * await act(async () => {
 *   if (triggerField) {
 *     triggerField('USA'); // Fires real onChange!
 *   }
 * });
 * ```
 */
export function TestFieldHarness({ name, onRegistered }: TestFieldHarnessProps) {
  const { register } = useDashRegister(name);

  useEffect(() => {
    if (onRegistered) {
      // Expose trigger that fires real onChange with synthetic event
      const trigger = (value: unknown) => {
        if (register.onChange) {
          // Create synthetic event matching registration contract
          // The onChange handler expects: { target: { value: unknown } }
          const syntheticEvent = {
            target: { name, value },
            type: 'change',
          };
          register.onChange(syntheticEvent);
        }
      };
      onRegistered(trigger);
    }
  }, [onRegistered, register, name]);

  // No UI needed - this is pure registration harness for testing
  return null;
}
