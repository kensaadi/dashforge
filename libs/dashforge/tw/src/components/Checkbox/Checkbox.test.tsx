// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { DashFormProvider } from '@dashforge/forms';
import { Checkbox } from './Checkbox.js';

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

describe('Checkbox — standalone (no DashFormProvider)', () => {
  it('renders the Radix root button + label association', () => {
    const { getByText, getByRole } = render(<Checkbox name="terms" label="Accept" />);
    expect(getByText('Accept')).toBeTruthy();
    expect(getByRole('checkbox')).toBeTruthy();
  });

  it('fires onCheckedChange callback when toggled', () => {
    const onCheckedChange = vi.fn();
    const { getByRole } = render(
      <Checkbox name="terms" label="Accept" onCheckedChange={onCheckedChange} />
    );
    fireEvent.click(getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('respects defaultChecked', () => {
    const { getByRole } = render(<Checkbox name="x" defaultChecked label="X" />);
    expect(getByRole('checkbox').getAttribute('data-state')).toBe('checked');
  });

  it('applies size variants', () => {
    const { container, rerender } = render(<Checkbox name="x" size="sm" label="X" />);
    expect(container.querySelector('button[role="checkbox"]')?.className).toContain('h-4');
    rerender(<Checkbox name="x" size="lg" label="X" />);
    expect(container.querySelector('button[role="checkbox"]')?.className).toContain('h-6');
  });

  it('shows helperText when explicitly supplied', () => {
    const { getByText } = render(
      <Checkbox name="x" label="X" helperText="Hint" />
    );
    expect(getByText('Hint')).toBeTruthy();
  });

  it('shows danger styling on error=true', () => {
    const { container } = render(<Checkbox name="x" label="X" error helperText="bad" />);
    const control = container.querySelector('button[role="checkbox"]');
    expect(control?.className).toContain('border-danger-500');
  });
});

describe('Checkbox — override (sx + slotProps)', () => {
  it('sx is applied to the root wrapper', () => {
    const { container } = render(<Checkbox name="x" label="X" sx="ml-8" />);
    expect((container.firstChild as HTMLElement).className).toContain('ml-8');
  });

  it('slotProps.control adds classes to the Radix root', () => {
    const { container } = render(
      <Checkbox
        name="x"
        label="X"
        slotProps={{ control: { className: 'ring-4 ring-purple-500' } }}
      />
    );
    expect(container.querySelector('button[role="checkbox"]')?.className).toContain(
      'ring-purple-500'
    );
  });

  it('slotProps.label adds classes to the label element', () => {
    const { getByText } = render(
      <Checkbox name="x" label="Hi" slotProps={{ label: { className: 'uppercase' } }} />
    );
    expect((getByText('Hi') as HTMLLabelElement).className).toContain('uppercase');
  });
});

describe('Checkbox — RBAC', () => {
  it('hides when access denies with onUnauthorized=hide', () => {
    const { queryByRole } = render(
      <RbacProvider policy={READ_ONLY} subject={viewer}>
        <Checkbox
          name="x"
          label="X"
          access={{ resource: 'doc', action: 'update', onUnauthorized: 'hide' }}
        />
      </RbacProvider>
    );
    expect(queryByRole('checkbox')).toBeNull();
  });

  it('disables when access denies with onUnauthorized=disable', () => {
    const { getByRole } = render(
      <RbacProvider policy={READ_ONLY} subject={viewer}>
        <Checkbox
          name="x"
          label="X"
          access={{ resource: 'doc', action: 'update', onUnauthorized: 'disable' }}
        />
      </RbacProvider>
    );
    expect((getByRole('checkbox') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Checkbox — DashFormProvider integration', () => {
  it('renders without crashing inside DashFormProvider', () => {
    const { getByRole } = render(withForm(<Checkbox name="terms" label="Accept" />));
    expect(getByRole('checkbox')).toBeTruthy();
  });

  it('respects explicit `checked` prop (controlled mode wins over bridge)', () => {
    // The explicit `checked` prop takes precedence over `bridge.getValue`.
    // Defaults propagation through RHF/Engine is covered by the
    // @dashforge/forms own test suite (DashFormProvider.* tests); here we
    // only verify the Checkbox honours the override path correctly.
    const { getByRole } = render(
      withForm(<Checkbox name="terms" label="Accept" checked />, { terms: false })
    );
    expect(getByRole('checkbox').getAttribute('data-state')).toBe('checked');
  });

  it('flips checked state on click (bridge.setValue + onChange)', () => {
    const { getByRole } = render(
      withForm(<Checkbox name="terms" label="Accept" />, { terms: false })
    );
    const cb = getByRole('checkbox');
    expect(cb.getAttribute('data-state')).toBe('unchecked');
    fireEvent.click(cb);
    expect(cb.getAttribute('data-state')).toBe('checked');
  });
});
