import { describe, it, expect } from 'vitest';
import {
  renderWithRbac,
  FULL_ACCESS_POLICY,
  NO_ACCESS_POLICY,
  adminSubject,
  guestSubject,
} from '../../test-utils';
import { Image } from './Image';

/**
 * RBAC integration for the MUI `<Image>`. `access` resolves against the
 * nearest RbacProvider: `hide` removes it, `disable`/`readonly` dim it.
 * `visibleWhen` (engine-reactive) is covered by integration tests.
 */
describe('<Image> (MUI) — access (RBAC)', () => {
  it('renders when access is granted', () => {
    const { container } = renderWithRbac(
      <Image src="/a.jpg" alt="a" access={{ resource: 'data', action: 'read' }} />,
      { policy: FULL_ACCESS_POLICY, subject: adminSubject },
    );
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('does not render when access is denied with hide', () => {
    const { container } = renderWithRbac(
      <Image
        src="/a.jpg"
        alt="a"
        access={{ resource: 'data', action: 'delete', onUnauthorized: 'hide' }}
      />,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('dims (aria-disabled) when denied with disable', () => {
    const { container } = renderWithRbac(
      <Image
        src="/a.jpg"
        alt="a"
        access={{ resource: 'data', action: 'delete', onUnauthorized: 'disable' }}
      />,
      { policy: NO_ACCESS_POLICY, subject: guestSubject },
    );
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('[aria-disabled="true"]')).toBeInTheDocument();
  });
});
