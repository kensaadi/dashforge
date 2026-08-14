import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import {
  renderWithRbac,
  FULL_ACCESS_POLICY,
  NO_ACCESS_POLICY,
  adminSubject,
  guestSubject,
} from '../../test-utils';
import { Stack } from './Stack';

/**
 * RBAC integration for the MUI `<Stack>`. `access` resolves against the
 * nearest RbacProvider: `hide` removes the region, `disable` / `readonly`
 * dim it.
 */
describe('<Stack> (MUI) — access (RBAC)', () => {
  it('renders when access is granted', () => {
    renderWithRbac(<Stack access={{ resource: 'data', action: 'read' }}>content</Stack>, {
      policy: FULL_ACCESS_POLICY,
      subject: adminSubject,
    });
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not render when access is denied with hide', () => {
    const { queryByText } = renderWithRbac(
      <Stack access={{ resource: 'data', action: 'delete', onUnauthorized: 'hide' }}>content</Stack>,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(queryByText('content')).not.toBeInTheDocument();
  });

  it('dims (aria-disabled) when denied with disable', () => {
    const { container } = renderWithRbac(
      <Stack access={{ resource: 'data', action: 'delete', onUnauthorized: 'disable' }}>
        content
      </Stack>,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(container.querySelector('[aria-disabled="true"]')).toBeInTheDocument();
  });
});
