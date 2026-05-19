/**
 * Walk a dotted path through an object and return the value, or
 * `undefined` if any segment is missing / nullish.
 *
 * Bug fix from the MUI-side Table (Sprint 4.1 motivation): the
 * existing wrapper typed `field: NestedKeyOf<T>` but performed a
 * flat `row[col.field]` lookup at runtime — nested keys silently
 * returned `undefined`. This helper makes the runtime match the
 * type contract.
 *
 * @example
 * ```ts
 * getNestedValue({ user: { name: 'Jane' } }, 'user.name')  // 'Jane'
 * getNestedValue({ user: null }, 'user.name')              // undefined
 * getNestedValue({}, 'a.b.c')                              // undefined
 * getNestedValue({ a: { b: 0 } }, 'a.b')                   // 0 (NOT undefined)
 * ```
 */
export function getNestedValue<T extends object>(
  row: T,
  path: string,
): unknown {
  if (!path) return undefined;
  const segments = path.split('.');
  let current: unknown = row;
  for (const segment of segments) {
    if (current == null) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
