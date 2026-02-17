import { useEffect, useRef } from 'react';

import { TextField, type TextFieldProps } from '../../primitives/TextField';

import {
  useNodeValue,
  useNodeEnabled,
  useNodeVisibility,
  type Engine,
} from '@dashforge/ui-core';

export interface BoundTextFieldProps
  extends Omit<TextFieldProps, 'value' | 'defaultValue'> {
  engine: Engine;
  nodeId: string;
  defaultValue?: string;
  parse?: (raw: string) => unknown;
  format?: (value: unknown) => string;
}

export function BoundTextField(props: BoundTextFieldProps) {
  const {
    engine,
    nodeId,
    defaultValue = '',
    parse,
    format,
    disabled,
    onChange,
    ...rest
  } = props;

  // Default value is applied only on first registration.
  const initialDefaultRef = useRef(defaultValue);

  useEffect(() => {
    if (!engine.getNode(nodeId)) {
      engine.registerNode({
        id: nodeId,
        value: initialDefaultRef.current,
        visible: true,
      });
    }

    return () => {
      engine.unregisterNode(nodeId);
    };
  }, [engine, nodeId]);

  const rawValue = useNodeValue(nodeId);
  const enabled = useNodeEnabled(nodeId);
  const visible = useNodeVisibility(nodeId);

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
