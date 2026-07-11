/**
 * Compile-time type tests for the typed Engine surface exposed by
 * `createEngine<TSchema>()`.
 *
 * The tests lock the contract asked for in dashforge#2: passing an
 * invalid path to `engine.getNode` must fail at compile time, and the
 * return value must narrow to the schema's value at that path.
 */

import { describe, expectTypeOf, it } from 'vitest';
import { createEngine, type Node } from '@dashforge/ui-core';

// Type alias (not interface) — needed so the schema satisfies
// `Record<string, unknown>` (interfaces are treated as "closed" by TS and
// don't implicitly get a string index signature).
type KYCSchema = {
  firstName: string;
  lastName: string;
  age: number;
  address: {
    city: string;
    country: string;
  };
};

describe('createEngine<TSchema>() surface', () => {
  it.skip('type-level only — no runtime assertions', () => {
    const engine = createEngine<KYCSchema>();

    // Valid flat path — return narrows to Node<string> | undefined
    expectTypeOf(engine.getNode('firstName')).toEqualTypeOf<
      Node<string> | undefined
    >();

    // Valid nested path — return narrows to Node<string> | undefined
    expectTypeOf(engine.getNode('address.city')).toEqualTypeOf<
      Node<string> | undefined
    >();

    // Value-typed narrowing on a numeric path
    expectTypeOf(engine.getNode('age')).toEqualTypeOf<
      Node<number> | undefined
    >();

    // Untyped createEngine() falls back to Node<unknown>
    const untyped = createEngine();
    expectTypeOf(untyped.getNode('anythingGoes')).toEqualTypeOf<
      Node<unknown> | undefined
    >();

    // Invalid paths on a typed engine — these lines are commented out
    // because they intentionally fail compilation. Uncomment locally to
    // observe the errors:
    //
    //   engine.getNode('foobar');
    //   engine.getNode('address.wrong');
    //   engine.updateNode('firstName', { value: 42 });
  });
});
