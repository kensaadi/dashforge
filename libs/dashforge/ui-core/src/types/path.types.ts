/**
 * Template-literal path types used to constrain string identifiers to
 * paths that actually exist on a given schema.
 *
 * Kept intentionally RHF-agnostic — `@dashforge/ui-core` must not depend on
 * `react-hook-form`. Consumers who use the RHF bridge get their own paths
 * inferred at the form layer and passed through as `TSchema`.
 *
 * Default behavior: `Path<Record<string, unknown>>` degrades to plain
 * `string`, so untyped consumers keep compiling exactly as before.
 */

/**
 * All dot-separated paths reachable on `T`.
 *
 * Objects recurse (`"user.address.city"`); arrays are treated as leaves for
 * now (`items` is a path, `items.0.name` is not). Array indexing can be
 * added later without a breaking change.
 *
 * @example
 * type P = Path<{ user: { name: string; address: { city: string } } }>
 * //   = "user" | "user.name" | "user.address" | "user.address.city"
 *
 * @example
 * type P = Path<Record<string, unknown>>
 * //   = string   (default fallback keeps untyped code compiling)
 */
export type Path<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? T[K] extends readonly unknown[]
          ? K
          : K | `${K}.${Path<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

/**
 * The value type at `P` inside `T`.
 *
 * @example
 * type V = PathValue<{ user: { age: number } }, "user.age">
 * //   = number
 *
 * @example
 * type V = PathValue<Record<string, unknown>, string>
 * //   = unknown   (default fallback)
 */
export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;
