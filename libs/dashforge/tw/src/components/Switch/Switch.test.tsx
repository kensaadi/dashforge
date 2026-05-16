// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { DashFormProvider } from '@dashforge/forms';
import { Switch } from './Switch.js';

const READ_ONLY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [{ resource: 'doc', action: 'update', effect: 'deny' }],
    },
  ],
};
const viewer: Subject = { id: 'v', roles: ['viewer'] };

function withForm(children: React.ReactNode, defaultValues: Record<string, unknown> = {}) {
  return <DashFormProvider defaultValues={defaultValues}>{children}</DashFormProvider>;
}

describe('Switch — standalone', () => {
  it('renders the Radix root with role="switch"', () => {
    const { getByRole } = render(<Switch name="notif" label="Notifications" />);
    expect(getByRole('switch')).toBeTruthy();
  });

  it('label is associated with the control via htmlFor', () => {
    const { getByText, getByRole } = render(<Switch name="x" label="On" />);
    const label = getByText('On') as HTMLLabelElement;
    const ctrl = getByRole('switch');
    expect(label.htmlFor).toBe(ctrl.id);
  });

  it('fires onCheckedChange', () => {
    const fn = vi.fn();
    const { getByRole } = render(<Switch name="x" onCheckedChange={fn} />);
    fireEvent.click(getByRole('switch'));
    expect(fn).toHaveBeenCalledWith(true);
  });

  it('respects defaultChecked when uncontrolled', () => {
    const { getByRole } = render(<Switch name="x" defaultChecked label="X" />);
    expect(getByRole('switch').getAttribute('data-state')).toBe('checked');
  });

  it('thumb sits in unchecked position by default', () => {
    const { container } = render(<Switch name="x" label="X" />);
    const thumb = container.querySelector('[data-state]')?.children[0];
    expect(thumb?.className).toContain('data-[state=unchecked]:translate-x-0');
  });

  it('size variants change control + thumb dimensions', () => {
    const { container, rerender } = render(<Switch name="x" size="sm" label="X" />);
    expect(container.querySelector('button[role="switch"]')?.className).toContain('h-4');
    rerender(<Switch name="x" size="lg" label="X" />);
    expect(container.querySelector('button[role="switch"]')?.className).toContain('h-7');
  });

  it('shows danger styling on error=true', () => {
    const { container } = render(<Switch name="x" error label="X" helperText="bad" />);
    const ctrl = container.querySelector('button[role="switch"]');
    expect(ctrl?.className).toContain('bg-danger-200');
  });
});

describe('Switch — override (sx + slotProps)', () => {
  it('sx applies to root', () => {
    const { container } = render(<Switch name="x" sx="ml-8" />);
    expect((container.firstChild as HTMLElement).className).toContain('ml-8');
  });

  it('slotProps.thumb decorates the thumb', () => {
    const { container } = render(
      <Switch name="x" slotProps={{ thumb: { className: 'ring-2 ring-purple-500' } }} />
    );
    const thumb = container.querySelector('button[role="switch"]')?.children[0];
    expect(thumb?.className).toContain('ring-purple-500');
  });
});

describe('Switch — RBAC', () => {
  it('hides when access denies with onUnauthorized=hide', () => {
    const { queryByRole } = render(
      <RbacProvider policy={READ_ONLY} subject={viewer}>
        <Switch
          name="x"
          label="X"
          access={{ resource: 'doc', action: 'update', onUnauthorized: 'hide' }}
        />
      </RbacProvider>
    );
    expect(queryByRole('switch')).toBeNull();
  });

  it('disables when access denies with onUnauthorized=disable', () => {
    const { getByRole } = render(
      <RbacProvider policy={READ_ONLY} subject={viewer}>
        <Switch
          name="x"
          label="X"
          access={{ resource: 'doc', action: 'update', onUnauthorized: 'disable' }}
        />
      </RbacProvider>
    );
    expect((getByRole('switch') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Switch — DashFormProvider integration', () => {
  it('renders inside DashFormProvider', () => {
    const { getByRole } = render(withForm(<Switch name="newsletter" label="Subscribe" />));
    expect(getByRole('switch')).toBeTruthy();
  });

  it('flips state on click (bridge.setValue + onChange)', () => {
    const { getByRole } = render(withForm(<Switch name="x" />, { x: false }));
    const sw = getByRole('switch');
    expect(sw.getAttribute('data-state')).toBe('unchecked');
    fireEvent.click(sw);
    expect(sw.getAttribute('data-state')).toBe('checked');
  });

  it('respects explicit `checked` (controlled wins over bridge)', () => {
    const { getByRole } = render(
      withForm(<Switch name="x" checked />, { x: false })
    );
    expect(getByRole('switch').getAttribute('data-state')).toBe('checked');
  });
});
