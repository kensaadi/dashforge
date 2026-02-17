/**
 * React hook for form field integration with the engine.
 *
 * This hook provides a standard interface for binding engine nodes to form inputs.
 */

import { useCallback } from 'react';
import type { NodeUpdate } from '../types/node.types';
import { useEngineNode } from './useEngineNode';
import { useEngineContext } from './EngineProvider';

/**
 * Result of the useEngineField hook.
 */
export interface EngineFieldResult<TValue = unknown> {
  /**
   * The current value of the field.
   */
  value: TValue | undefined;

  /**
   * Function to update the field value.
   */
  onChange: (value: TValue) => void;

  /**
   * Whether the field is disabled.
   */
  disabled: boolean;

  /**
   * Error message for the field (if any).
   */
  error?: string;

  /**
   * Whether the field is visible.
   */
  visible: boolean;
}

/**
 * Hook to bind a form field to an engine node.
 *
 * This provides a convenient interface for connecting form inputs to engine nodes
 * with automatic value updates and state synchronization.
 *
 * @param nodeId - The ID of the node to bind to
 * @returns Field binding object with value, onChange, and state flags
 *
 * @example
 * ```tsx
 * function FormField() {
 *   const field = useEngineField<string>('firstName');
 *
 *   if (!field.visible) return null;
 *
 *   return (
 *     <div>
 *       <input
 *         value={field.value ?? ''}
 *         onChange={(e) => field.onChange(e.target.value)}
 *         disabled={field.disabled}
 *       />
 *       {field.error && <span>{field.error}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useEngineField<TValue = unknown>(
  nodeId: string
): EngineFieldResult<TValue> {
  const engine = useEngineContext();
  const node = useEngineNode<TValue>(nodeId);

  const onChange = useCallback(
    (value: TValue) => {
      const update: NodeUpdate<TValue> = { value };
      engine.updateNode(nodeId, update);
    },
    [engine, nodeId]
  );

  const result: EngineFieldResult<TValue> = {
    value: node?.value,
    onChange,
    disabled: node?.disabled ?? false,
    visible: node?.visible ?? true,
  };

  if (node?.error !== undefined) {
    result.error = node.error;
  }

  return result;
}

/**
 * Hook to bind a checkbox field to an engine node.
 *
 * This is a specialized version of useEngineField for boolean checkboxes.
 *
 * @param nodeId - The ID of the node to bind to
 * @returns Field binding object optimized for checkboxes
 *
 * @example
 * ```tsx
 * function CheckboxField() {
 *   const field = useEngineCheckbox('agreeToTerms');
 *
 *   return (
 *     <label>
 *       <input
 *         type="checkbox"
 *         checked={field.checked}
 *         onChange={(e) => field.onChange(e.target.checked)}
 *         disabled={field.disabled}
 *       />
 *       I agree to the terms
 *     </label>
 *   );
 * }
 * ```
 */
export function useEngineCheckbox(nodeId: string): {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  error?: string;
  visible: boolean;
} {
  const field = useEngineField<boolean>(nodeId);

  const result: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled: boolean;
    error?: string;
    visible: boolean;
  } = {
    checked: field.value ?? false,
    onChange: field.onChange,
    disabled: field.disabled,
    visible: field.visible,
  };

  if (field.error !== undefined) {
    result.error = field.error;
  }

  return result;
}

/**
 * Hook to bind a select/dropdown field to an engine node.
 *
 * @param nodeId - The ID of the node to bind to
 * @param options - Available options for the select
 * @returns Field binding object optimized for selects
 *
 * @example
 * ```tsx
 * function SelectField() {
 *   const field = useEngineSelect('country', [
 *     { value: 'us', label: 'United States' },
 *     { value: 'ca', label: 'Canada' },
 *     { value: 'mx', label: 'Mexico' },
 *   ]);
 *
 *   return (
 *     <select
 *       value={field.value ?? ''}
 *       onChange={(e) => field.onChange(e.target.value)}
 *       disabled={field.disabled}
 *     >
 *       {field.options.map(opt => (
 *         <option key={opt.value} value={opt.value}>
 *           {opt.label}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useEngineSelect<TValue = string>(
  nodeId: string,
  options: Array<{ value: TValue; label: string }>
): {
  value: TValue | undefined;
  onChange: (value: TValue) => void;
  options: Array<{ value: TValue; label: string }>;
  disabled: boolean;
  error?: string;
  visible: boolean;
} {
  const field = useEngineField<TValue>(nodeId);

  const result: {
    value: TValue | undefined;
    onChange: (value: TValue) => void;
    options: Array<{ value: TValue; label: string }>;
    disabled: boolean;
    error?: string;
    visible: boolean;
  } = {
    value: field.value,
    onChange: field.onChange,
    options,
    disabled: field.disabled,
    visible: field.visible,
  };

  if (field.error !== undefined) {
    result.error = field.error;
  }

  return result;
}
