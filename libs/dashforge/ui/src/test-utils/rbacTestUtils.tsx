import { render, type RenderResult } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import type { ReactElement } from 'react';
import { renderWithBridge } from './renderWithBridge';
import type { RenderWithBridgeOptions } from './renderWithBridge';

/**
 * Mock RBAC policies for testing
 */

export const FULL_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ resource: '*', action: '*', effect: 'allow' }],
    },
  ],
};

export const NO_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'guest',
      permissions: [], // No permissions
    },
  ],
};

export const READ_ONLY_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { resource: '*', action: 'read', effect: 'allow' },
        { resource: '*', action: 'update', effect: 'deny' },
        { resource: '*', action: 'delete', effect: 'deny' },
      ],
    },
  ],
};

/**
 * Mock subjects for testing
 */

export const adminSubject: Subject = {
  id: 'admin-user',
  roles: ['admin'],
};

export const guestSubject: Subject = {
  id: 'guest-user',
  roles: ['guest'],
};

export const viewerSubject: Subject = {
  id: 'viewer-user',
  roles: ['viewer'],
};

/**
 * Render a component wrapped with RbacProvider for testing RBAC behavior.
 *
 * @param ui - The component to render
 * @param options - Optional RBAC configuration
 * @returns Render result from @testing-library/react
 *
 * @example
 * ```tsx
 * const { getByLabelText } = renderWithRbac(
 *   <TextField name="field" access={{ resource: 'data', action: 'read' }} />,
 *   { policy: FULL_ACCESS_POLICY, subject: adminSubject }
 * );
 * ```
 */
export function renderWithRbac(
  ui: ReactElement,
  options?: {
    policy?: RbacPolicy;
    subject?: Subject;
  }
): RenderResult {
  const policy = options?.policy ?? FULL_ACCESS_POLICY;
  const subject = options?.subject ?? adminSubject;

  return render(
    <RbacProvider policy={policy} subject={subject}>
      {ui}
    </RbacProvider>
  );
}

/**
 * Render a component wrapped with both DashFormBridge and RbacProvider.
 *
 * This combines form integration testing with RBAC testing.
 *
 * @param ui - The component to render
 * @param options - Combined bridge and RBAC options
 * @returns Render result with bridge state
 *
 * @example
 * ```tsx
 * const { getByLabelText, state } = renderWithBridgeAndRbac(
 *   <TextField
 *     name="field"
 *     access={{ resource: 'data', action: 'update' }}
 *   />,
 *   {
 *     mockBridgeOptions: { defaultValues: { field: 'value' } },
 *     policy: READ_ONLY_POLICY,
 *     subject: viewerSubject
 *   }
 * );
 * ```
 */
export function renderWithBridgeAndRbac(
  ui: ReactElement,
  options?: RenderWithBridgeOptions & {
    policy?: RbacPolicy;
    subject?: Subject;
  }
) {
  const policy = options?.policy ?? FULL_ACCESS_POLICY;
  const subject = options?.subject ?? adminSubject;

  // Wrap the UI with RbacProvider, then pass to renderWithBridge
  // This ensures both providers are active
  const wrappedUi = (
    <RbacProvider policy={policy} subject={subject}>
      {ui}
    </RbacProvider>
  );

  return renderWithBridge(wrappedUi, {
    mockBridgeOptions: options?.mockBridgeOptions,
  });
}
