import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { SxProps, Theme } from '@mui/material/styles';
import { useAccessState } from './useAccessState';

/**
 * Resolved gating decision for a display / layout component.
 *
 * @see useGating
 */
export interface GatingState {
  /**
   * `true` when the element must not render at all — either
   * `visibleWhen` returned `false`, or `access` resolved to a hidden
   * state (`onUnauthorized: 'hide'`). Callers should `return null`.
   */
  hidden: boolean;
  /**
   * `true` when the element still renders but should be dimmed and
   * non-interactive — `access` resolved to `disable` / `readonly`.
   * Layout primitives have no intrinsic disabled state, so this is a
   * visual + `pointer-events` treatment applied to the whole subtree.
   */
  dimmed: boolean;
}

/**
 * Shared visibility + RBAC gating for display / layout components
 * (`Box`, `Stack`, `Grid`). Mirrors the gating the form components use,
 * factored out so the layout primitives resolve it identically.
 *
 * Both hooks are always called (rules of hooks) — the caller applies the
 * early `return null` after invoking this hook.
 *
 * - `visibleWhen` is evaluated against the nearest `<DashForm>` engine
 *   (no-op outside a form).
 * - `access` is evaluated against the nearest `RbacProvider` and fails
 *   safe to fully-visible when none is mounted.
 *
 * @param access - Optional RBAC access requirement.
 * @param visibleWhen - Optional engine-reactive visibility predicate.
 * @returns The resolved {@link GatingState}.
 */
export function useGating(
  access: AccessRequirement | undefined,
  visibleWhen: ((engine: Engine) => boolean) | undefined,
): GatingState {
  const bridge = useContext(DashFormContext);
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  return {
    hidden: !isVisible || !accessState.visible,
    dimmed: accessState.disabled || accessState.readonly,
  };
}

/** Emotion-friendly `sx` value for the dimmed (disable / readonly) state. */
const DIMMED_SX = { opacity: 0.6, pointerEvents: 'none' as const };

/**
 * Merge a component's incoming `sx` with the dimmed treatment when a
 * gated element is in the `disable` / `readonly` state. Normalises the
 * union `sx` shape (object | array | function) into a single array so the
 * dimmed rule composes with — and is overridable by — the caller's `sx`.
 *
 * @param dimmed - Whether to prepend the dimmed treatment.
 * @param sx - The caller's `sx`.
 * @returns An `sx` array suitable for a MUI component.
 */
export function gatedSx(
  dimmed: boolean,
  sx: SxProps<Theme> | undefined,
): SxProps<Theme> {
  return [
    ...(dimmed ? [DIMMED_SX] : []),
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ] as SxProps<Theme>;
}
