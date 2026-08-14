import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import {
  renderWithRbac,
  FULL_ACCESS_POLICY,
  NO_ACCESS_POLICY,
  adminSubject,
  guestSubject,
} from '../../test-utils';
import { Box } from './Box';

/**
 * RBAC integration for the MUI `<Box>`. `access` resolves against the
 * nearest RbacProvider: `hide` removes the region, `disable` / `readonly`
 * dim it. `visibleWhen` (engine-reactive) is covered by integration tests.
 */
describe('<Box> (MUI) — access (RBAC)', () => {
  it('renders when access is granted', () => {
    renderWithRbac(<Box access={{ resource: 'data', action: 'read' }}>content</Box>, {
      policy: FULL_ACCESS_POLICY,
      subject: adminSubject,
    });
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not render when access is denied with hide', () => {
    const { queryByText } = renderWithRbac(
      <Box access={{ resource: 'data', action: 'delete', onUnauthorized: 'hide' }}>content</Box>,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(queryByText('content')).not.toBeInTheDocument();
  });

  it('dims (aria-disabled) when denied with disable', () => {
    const { container } = renderWithRbac(
      <Box access={{ resource: 'data', action: 'delete', onUnauthorized: 'disable' }}>content</Box>,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(container.querySelector('[aria-disabled="true"]')).toBeInTheDocument();
  });
});
