import { describe, it, expect } from 'vitest';
import {
  renderWithRbac,
  FULL_ACCESS_POLICY,
  NO_ACCESS_POLICY,
  adminSubject,
  guestSubject,
} from '../../test-utils';
import { Video } from './Video';

/**
 * RBAC integration for the MUI `<Video>`. `access` resolves against the
 * nearest RbacProvider: `hide` removes it, `disable`/`readonly` dim it.
 * `visibleWhen` (engine-reactive) is covered by integration tests.
 */
describe('<Video> (MUI) — access (RBAC)', () => {
  it('renders when access is granted', () => {
    const { container } = renderWithRbac(
      <Video src="/a.mp4" access={{ resource: 'data', action: 'read' }} />,
      { policy: FULL_ACCESS_POLICY, subject: adminSubject },
    );
    expect(container.querySelector('video')).toBeInTheDocument();
  });

  it('does not render when access is denied with hide', () => {
    const { container } = renderWithRbac(
      <Video src="/a.mp4" access={{ resource: 'data', action: 'delete', onUnauthorized: 'hide' }} />,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('dims (aria-disabled) when denied with disable', () => {
    const { container } = renderWithRbac(
      <Video
        src="/a.mp4"
        access={{ resource: 'data', action: 'delete', onUnauthorized: 'disable' }}
      />,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(container.querySelector('video')).toBeInTheDocument();
    expect(container.querySelector('[aria-disabled="true"]')).toBeInTheDocument();
  });
});
