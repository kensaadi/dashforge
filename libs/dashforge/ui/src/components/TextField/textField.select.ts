import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';

/**
 * Props returned by useSelectIntegration for MUI TextField in Select mode
 */
export interface SelectIntegrationProps {
  value: unknown;
  onChange: MuiTextFieldProps['onChange'];
  onBlur: MuiTextFieldProps['onBlur'];
  inputRef: MuiTextFieldProps['inputRef'];
  slotProps: MuiTextFieldProps['slotProps'];
}

/**
 * Creates a synthetic event with target.name and target.value
 * for form bridge compatibility
 */
function createSyntheticEvent(name: string, value: unknown) {
  return {
    target: { name, value },
    type: 'change',
  };
}

/**
 * Creates a synthetic blur event with proper target properties
 */
function createSyntheticBlurEvent(name: string, value: unknown): FocusEvent {
  const syntheticEvent = new FocusEvent('blur', {
    bubbles: true,
    cancelable: true,
  });

  Object.defineProperty(syntheticEvent, 'target', {
    writable: false,
    value: { name, value },
  });

  return syntheticEvent;
}

/**
 * Extracts value from MUI SelectChangeEvent
 */
function extractValueFromEvent(event: unknown): unknown {
  if (event && typeof event === 'object' && 'target' in event) {
    const target = (event as { target: unknown }).target;
    if (target && typeof target === 'object' && 'value' in target) {
      return (target as { value: unknown }).value;
    }
  }
  return undefined;
}

/**
 * Hook to integrate MUI Select with DashForm bridge
 *
 * Handles:
 * - Controlled value from bridge
 * - onChange wrapping (MUI SelectChangeEvent → bridge event)
 * - Touch tracking (onBlur for native, onClose for MUI Select)
 * - Proper event shape for form validation
 */
export function createSelectIntegration(
  name: string,
  bridge: DashFormBridge,
  registration: FieldRegistration,
  userSlotProps: MuiTextFieldProps['slotProps'],
  isNativeSelect: boolean
): SelectIntegrationProps {
  // Get current value from bridge for controlled component
  const value = bridge.getValue?.(name) ?? '';

  // Wrap onChange to provide correct event shape
  const handleChange = async (event: unknown) => {
    const extractedValue = extractValueFromEvent(event);
    const syntheticEvent = createSyntheticEvent(name, extractedValue);

    // Call registration onChange
    if (registration.onChange) {
      await registration.onChange(syntheticEvent);
    }

    // Also use bridge.setValue to ensure value is updated
    // This is necessary because MUI Select doesn't have a real DOM input
    if (bridge.setValue) {
      bridge.setValue(name, extractedValue);
    }
  };

  // For native select, create onBlur handler
  const handleBlur = isNativeSelect
    ? () => {
        const valueAtBlurTime = bridge.getValue?.(name) ?? '';
        const syntheticEvent = createSyntheticBlurEvent(name, valueAtBlurTime);

        if (registration.onBlur) {
          registration.onBlur(syntheticEvent);
        }
      }
    : undefined;

  // For MUI Select (non-native), handle touch state via onClose
  // MUI Select doesn't properly trigger onBlur on the combobox div
  const handleClose = !isNativeSelect
    ? () => {
        const valueAtCloseTime = bridge.getValue?.(name) ?? '';
        const syntheticEvent = createSyntheticBlurEvent(name, valueAtCloseTime);

        if (registration.onBlur) {
          registration.onBlur(syntheticEvent);
        }

        // Call user's onClose if provided
        const userOnClose = userSlotProps?.select as
          | { onClose?: (event: unknown, reason?: string) => void }
          | undefined;
        if (userOnClose?.onClose) {
          userOnClose.onClose({}, 'selectOption');
        }
      }
    : (userSlotProps?.select as { onClose?: unknown } | undefined)?.onClose;

  return {
    value,
    onChange: handleChange as MuiTextFieldProps['onChange'],
    onBlur: handleBlur as MuiTextFieldProps['onBlur'],
    inputRef: registration.ref,
    slotProps: {
      ...userSlotProps,
      select: {
        ...(userSlotProps?.select as Record<string, unknown> | undefined),
        onClose: handleClose,
      },
      htmlInput: {
        ...(userSlotProps?.htmlInput as Record<string, unknown> | undefined),
        name,
      },
    } as MuiTextFieldProps['slotProps'],
  };
}

/**
 * Checks if Select is in native mode
 */
export function isNativeSelectMode(
  slotProps: MuiTextFieldProps['slotProps']
): boolean {
  const selectProps = slotProps?.select as { native?: boolean } | undefined;
  return selectProps?.native === true;
}
