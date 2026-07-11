/**
 * Compile-time type tests for `Path<T>` and `PathValue<T, P>`.
 *
 * These are NOT runtime tests. They exercise the type system via
 * `expectTypeOf` — an assertion here fails the build (TS error) rather
 * than a test run. The single `it.skip` block keeps vitest quiet at
 * runtime while still surfacing the file as a test asset.
 */

import { describe, expectTypeOf, it } from 'vitest';
import type { Path, PathValue } from '../path.types';

interface Sample {
  firstName: string;
  age: number;
  user: {
    email: string;
    address: {
      city: string;
      zip: number;
    };
  };
  tags: string[];
}

describe('Path<T>', () => {
  it.skip('type-level only — no runtime assertions', () => {
    // Flat keys accepted
    expectTypeOf<'firstName'>().toMatchTypeOf<Path<Sample>>();
    expectTypeOf<'age'>().toMatchTypeOf<Path<Sample>>();

    // Nested keys accepted
    expectTypeOf<'user.email'>().toMatchTypeOf<Path<Sample>>();
    expectTypeOf<'user.address.city'>().toMatchTypeOf<Path<Sample>>();
    expectTypeOf<'user.address.zip'>().toMatchTypeOf<Path<Sample>>();

    // Array-valued key accepted as a leaf (arrays are not yet indexable)
    expectTypeOf<'tags'>().toMatchTypeOf<Path<Sample>>();

    // Invalid keys rejected — flip the assertion via `not`
    expectTypeOf<'foobar'>().not.toMatchTypeOf<Path<Sample>>();
    expectTypeOf<'user.wrong'>().not.toMatchTypeOf<Path<Sample>>();
    expectTypeOf<'user.address.wrong'>().not.toMatchTypeOf<Path<Sample>>();

    // Default fallback: untyped schemas degrade Path to string
    expectTypeOf<string>().toEqualTypeOf<Path<Record<string, unknown>>>();
  });
});

describe('PathValue<T, P>', () => {
  it.skip('type-level only — no runtime assertions', () => {
    // Flat value narrowing
    expectTypeOf<PathValue<Sample, 'firstName'>>().toEqualTypeOf<string>();
    expectTypeOf<PathValue<Sample, 'age'>>().toEqualTypeOf<number>();

    // Nested value narrowing
    expectTypeOf<PathValue<Sample, 'user.email'>>().toEqualTypeOf<string>();
    expectTypeOf<PathValue<Sample, 'user.address.city'>>().toEqualTypeOf<string>();
    expectTypeOf<PathValue<Sample, 'user.address.zip'>>().toEqualTypeOf<number>();

    // Container value at a non-leaf path
    expectTypeOf<PathValue<Sample, 'user.address'>>().toEqualTypeOf<{
      city: string;
      zip: number;
    }>();

    // Array-valued leaf
    expectTypeOf<PathValue<Sample, 'tags'>>().toEqualTypeOf<string[]>();

    // Default fallback: PathValue over Record<string, unknown> yields unknown
    expectTypeOf<
      PathValue<Record<string, unknown>, 'anything'>
    >().toEqualTypeOf<unknown>();
  });
});
