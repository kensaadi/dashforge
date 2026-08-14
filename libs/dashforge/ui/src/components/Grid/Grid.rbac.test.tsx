import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import {
  renderWithRbac,
  FULL_ACCESS_POLICY,
  NO_ACCESS_POLICY,
  adminSubject,
  guestSubject,
} from '../../test-utils';
import { Grid } from './Grid';

/**
 * RBAC integration for the MUI `<Grid>`. `access` resolves against the
 * nearest RbacProvider: `hide` removes the node, `disable` / `readonly`
 * dim it. Gating works on a container or an item alike.
 */
describe('<Grid> (MUI) — access (RBAC)', () => {
  it('renders when access is granted', () => {
    renderWithRbac(
      <Grid container>
        <Grid access={{ resource: 'data', action: 'read' }}>content</Grid>
      </Grid>,
      { policy: FULL_ACCESS_POLICY, subject: adminSubject },
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not render the item when access is denied with hide', () => {
    const { queryByText } = renderWithRbac(
      <Grid container>
        <Grid access={{ resource: 'data', action: 'delete', onUnauthorized: 'hide' }}>
          content
        </Grid>
      </Grid>,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(queryByText('content')).not.toBeInTheDocument();
  });

  it('dims (aria-disabled) when denied with disable', () => {
    const { container } = renderWithRbac(
      <Grid container>
        <Grid access={{ resource: 'data', action: 'delete', onUnauthorized: 'disable' }}>
          content
        </Grid>
      </Grid>,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(container.querySelector('[aria-disabled="true"]')).toBeInTheDocument();
  });
});
