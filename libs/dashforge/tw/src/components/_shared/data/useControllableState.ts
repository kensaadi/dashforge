import { useCallback, useRef, useState } from 'react';

/**
 * Generic "controllable" state hook — switches between controlled
 * (via parent-supplied value + setter) and uncontrolled (internal
 * `useState`).
 *
 * - If `controlledValue !== undefined`, the hook is in **controlled**
 *   mode: the internal state is ignored; the returned setter calls
 *   `onControlledChange` only.
 * - Otherwise it's in **uncontrolled** mode: internal `useState`,
 *   defaulting to `defaultValue`. The optional `onControlledChange`
 *   is still fired on every change so the parent can react.
 *
 * The control mode is determined per-render. Mixing modes (passing
 * `controlledValue` undefined sometimes) is a consumer bug — we don't
 * try to "remember" the last mode (React's rules-of-hooks make that
 * unsafe).
 */
export function useControllableState<T>(args: {
  controlledValue: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T | ((prev: T) => T)) => void] {
  const { controlledValue, defaultValue, onChange } = args;
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? (controlledValue as T) : uncontrolledValue;

  // Stable ref to `onChange` so the setter doesn't change identity
  // every render (consumer can pass an inline lambda safely).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      if (!isControlled) {
        setUncontrolledValue(resolved);
      }
      onChangeRef.current?.(resolved);
    },
    [isControlled, value],
  );

  return [value, setValue];
}
