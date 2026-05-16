import { useMemo } from 'react';
import { useRbacOptional, resolveAccessState } from '@dashforge/rbac';
import type { AccessRequirement, AccessState } from '@dashforge/rbac';

/**
 * Default full-access state. Returned when no access requirement is
 * supplied **or** when no `RbacProvider` is mounted (fail-safe default).
 *
 * @internal
 */
const DEFAULT_ACCESS_STATE: AccessState = {
  visible: true,
  disabled: false,
  readonly: false,
  granted: true,
};

/**
 * Hook to resolve RBAC access state for a UI component.
 *
 * **TW-side copy of the MUI implementation** in `@dashforge/ui/src/hooks/useAccessState.ts`.
 * Per the architecture plan v2 (2026-05-15) the two ecosystems share
 * only the bridge layer (`@dashforge/forms` + `@dashforge/ui-core` +
 * `@dashforge/rbac`); UI-side hooks are duplicated intentionally so
 * the MUI and TW ecosystems remain fully isolated.
 *
 * The behaviour is byte-equivalent to the MUI side:
 *
 *  - If `access` is undefined → returns `DEFAULT_ACCESS_STATE`.
 *  - If `access` is supplied but no `RbacProvider` is mounted → returns
 *    `DEFAULT_ACCESS_STATE` and emits a dev-only `console.warn` so the
 *    developer notices the missing provider. Failing **open** is the
 *    safer default (RBAC silently denying everything would be a hidden
 *    regression in development).
 *  - Otherwise → evaluates the requirement against the active
 *    `rbac.engine` + `rbac.subject` via `resolveAccessState`.
 *
 * The memo dependency list is `[access, rbac]` — a stable RBAC
 * context + identical access requirement re-uses the same result
 * object so downstream `useMemo` / `React.memo` comparisons stay
 * cheap.
 *
 * @example
 * ```tsx
 * function MyComponent({ access }: { access?: AccessRequirement }) {
 *   const accessState = useAccessState(access);
 *   if (!accessState.visible) return null;
 *   return <input disabled={accessState.disabled} readOnly={accessState.readonly} />;
 * }
 * ```
 */
export function useAccessState(
  access: AccessRequirement | undefined
): AccessState {
  // Hooks are called unconditionally to comply with the rules of hooks.
  // `useRbacOptional` returns `null` when no provider is mounted
  // (it does NOT throw — that's intentional, see its doc).
  const rbac = useRbacOptional();

  return useMemo(() => {
    if (!access) {
      return DEFAULT_ACCESS_STATE;
    }

    if (!rbac) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          '[useAccessState] No RbacProvider found but access requirement was provided. ' +
            'Defaulting to full access. Wrap your component tree with <RbacProvider> to enable RBAC. ' +
            `Resource: ${access.resource}, Action: ${access.action}`
        );
      }
      return DEFAULT_ACCESS_STATE;
    }

    return resolveAccessState(access, (request) =>
      rbac.engine.can(rbac.subject, request)
    );
  }, [access, rbac]);
}
