import { useEffect, useRef } from 'react';

import { TextField, type TextFieldProps } from '../../primitives/TextField';

import {
  useNodeValue,
  useNodeEnabled,
  useNodeVisibility,
  useEngineContext,
} from '@dashforge/ui-core';

import * as CoreFromUI from '@dashforge/ui-core';
console.log(
  'UI ui-core useEngineContext ===',
  (CoreFromUI as any).useEngineContext
);

export interface BoundTextFieldProps
  extends Omit<TextFieldProps, 'value' | 'defaultValue'> {
  nodeId: string;
  defaultValue?: string;
  /**
   * Initial visibility state when registering a new node.
   * Ignored if node already exists.
   * @default true
   */
  initialVisible?: boolean;
  /**
   * Whether to unregister the node from the engine on unmount.
   * In most cases, node lifecycle should be managed by the form/engine owner,
   * not individual fields. Only set to true if this field owns the node lifecycle.
   * @default false
   */
  unregisterOnUnmount?: boolean;
  parse?: (raw: string) => unknown;
  format?: (value: unknown) => string;
}

export function BoundTextField(props: BoundTextFieldProps) {
  const {
    nodeId,
    defaultValue = '',
    initialVisible = true,
    unregisterOnUnmount = false,
    parse,
    format,
    disabled,
    onChange,
    ...rest
  } = props;

  const engine = useEngineContext();
  // Default value is applied only on first registration.
  const initialDefaultRef = useRef(defaultValue);
  // Initial visibility is applied only on first registration.
  const initialVisibleRef = useRef(initialVisible);

  /**
   * Guard flag to prevent duplicate node registration in React StrictMode.
   * StrictMode double-invokes component functions during development.
   * This ensures node registration happens exactly once before first render,
   * providing deterministic initial visibility state for predictive rules.
   */
  const didEnsureNodeRef = useRef(false);

  // Ensure node exists BEFORE first render decision (synchronous, idempotent)
  if (!didEnsureNodeRef.current) {
    if (!engine.getNode(nodeId)) {
      engine.registerNode({
        id: nodeId,
        value: initialDefaultRef.current,
        visible: initialVisibleRef.current,
      });
    }
    didEnsureNodeRef.current = true;
  }

  // Optional cleanup: only unregister node on unmount if explicitly requested
  useEffect(() => {
    if (!unregisterOnUnmount) return;

    return () => {
      engine.unregisterNode(nodeId);
    };
  }, [engine, nodeId, unregisterOnUnmount]);

  const rawValue = useNodeValue(nodeId);
  const enabled = useNodeEnabled(nodeId);
  const visible = useNodeVisibility(nodeId);

  // Debug: Check if hook and engine agree on visibility
  console.log(
    `[BoundTextField ${nodeId}] visible hook =`,
    visible,
    'engine visible =',
    engine.getNode(nodeId)?.visible
  );

  if (!visible) return null;

  const value =
    typeof format === 'function' ? format(rawValue) : String(rawValue ?? '');

  const handleChange: NonNullable<TextFieldProps['onChange']> = (event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const nextRaw = target.value; // ✅ typed

    const nextValue = typeof parse === 'function' ? parse(nextRaw) : nextRaw;

    engine.updateNode(nodeId, { value: nextValue });

    onChange?.(
      event as unknown as Parameters<NonNullable<TextFieldProps['onChange']>>[0]
    );
  };

  return (
    <TextField
      {...rest}
      value={value}
      disabled={disabled ?? !enabled}
      onChange={handleChange as TextFieldProps['onChange']}
    />
  );
}
