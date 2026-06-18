// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { Button } from './Button.js';

const READ_ONLY_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { resource: 'doc', action: 'read', effect: 'allow' },
        { resource: 'doc', action: 'delete', effect: 'deny' },
      ],
    },
  ],
};
const viewer: Subject = { id: 'v', roles: ['viewer'] };

describe('Button — basic rendering', () => {
  it('renders children inside a <button>', () => {
    const { getByText } = render(<Button>Save</Button>);
    const node = getByText('Save');
    expect(node.tagName).toBe('BUTTON');
  });

  it('defaults type="button" (not "submit")', () => {
    const { getByText } = render(<Button>Save</Button>);
    expect((getByText('Save') as HTMLButtonElement).type).toBe('button');
  });

  it('forwards type="submit" when supplied', () => {
    const { getByText } = render(<Button type="submit">Send</Button>);
    expect((getByText('Send') as HTMLButtonElement).type).toBe('submit');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button onClick={onClick}>Hit</Button>);
    fireEvent.click(getByText('Hit'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Button — variant classes', () => {
  it('applies the solid + primary default classes', () => {
    const { getByText } = render(<Button>X</Button>);
    const cls = getByText('X').className;
    expect(cls).toContain('bg-primary-500');
    expect(cls).toContain('inline-flex'); // base
    expect(cls).toContain('h-10'); // size=md default
  });

  it('switches color palette on `color="danger"`', () => {
    const { getByText } = render(<Button color="danger">X</Button>);
    const cls = getByText('X').className;
    expect(cls).toContain('bg-danger-500');
    expect(cls).not.toContain('bg-primary-500');
  });

  it('outline variant uses border + text-{color}-700', () => {
    const { getByText } = render(<Button variant="outline" color="success">X</Button>);
    const cls = getByText('X').className;
    expect(cls).toContain('border-success-500');
    expect(cls).toContain('text-success-700');
  });

  it('size sm/lg map to h-8/h-12', () => {
    const { getByText: small } = render(<Button size="sm">S</Button>);
    expect(small('S').className).toContain('h-8');
    const { getByText: large } = render(<Button size="lg">L</Button>);
    expect(large('L').className).toContain('h-12');
  });

  it('fullWidth adds w-full', () => {
    const { getByText } = render(<Button fullWidth>X</Button>);
    expect(getByText('X').className).toContain('w-full');
  });
});

describe('Button — override (sx wins via tailwind-merge)', () => {
  it('sx is appended after variant classes', () => {
    const { getByText } = render(<Button sx="ml-4">X</Button>);
    expect(getByText('X').className).toContain('ml-4');
  });

  it('sx overrides a conflicting variant class via tailwind-merge', () => {
    // variant produces `bg-primary-500`; sx forces `bg-red-500` — must win.
    const { getByText } = render(<Button sx="bg-red-500">X</Button>);
    const cls = getByText('X').className;
    expect(cls).toContain('bg-red-500');
    expect(cls).not.toContain('bg-primary-500');
  });
});

describe('Button — loading state', () => {
  it('disables the button and shows the spinner', () => {
    const { getByText, container } = render(<Button loading>Save</Button>);
    expect((getByText('Save').parentElement as HTMLButtonElement)?.disabled || (getByText('Save') as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('does not fire onClick when loading (disabled native attr)', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button loading onClick={onClick}>Save</Button>);
    fireEvent.click(getByText('Save'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Button — RBAC', () => {
  function withRbac(children: React.ReactNode) {
    return (
      <RbacProvider policy={READ_ONLY_POLICY} subject={viewer}>
        {children}
      </RbacProvider>
    );
  }

  it('renders normally when no access prop is supplied', () => {
    const { getByText } = render(withRbac(<Button>X</Button>));
    expect(getByText('X')).toBeTruthy();
  });

  it('hides when access denies with onUnauthorized=hide', () => {
    const { queryByText } = render(
      withRbac(
        <Button access={{ resource: 'doc', action: 'delete', onUnauthorized: 'hide' }}>
          Delete
        </Button>
      )
    );
    expect(queryByText('Delete')).toBeNull();
  });

  it('disables when access denies with onUnauthorized=disable', () => {
    const { getByText } = render(
      withRbac(
        <Button access={{ resource: 'doc', action: 'delete', onUnauthorized: 'disable' }}>
          Delete
        </Button>
      )
    );
    expect((getByText('Delete') as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables (fallback) when access denies with onUnauthorized=readonly', () => {
    const { getByText } = render(
      withRbac(
        <Button access={{ resource: 'doc', action: 'delete', onUnauthorized: 'readonly' }}>
          Delete
        </Button>
      )
    );
    expect((getByText('Delete') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Button — asChild polymorphism', () => {
  it('renders the child element with the Button class merged in', () => {
    const { getByText } = render(
      <Button asChild variant="solid" color="primary">
        <a href="/dashboard">Open</a>
      </Button>
    );
    const node = getByText('Open');
    expect(node.tagName).toBe('A');
    expect((node as HTMLAnchorElement).getAttribute('href')).toBe('/dashboard');
    expect(node.className).toContain('bg-primary-500');
  });

  it('sets data-disabled + aria-disabled when effectiveDisabled', () => {
    const { getByText } = render(
      <Button asChild disabled>
        <a href="/x">X</a>
      </Button>
    );
    const node = getByText('X');
    expect(node.getAttribute('data-disabled')).toBe('true');
    expect(node.getAttribute('aria-disabled')).toBe('true');
  });
});

describe('Button — visibleWhen (engine-reactive visibility, Sprint 4.4)', () => {
  it('renders when visibleWhen returns true (no DashForm context)', () => {
    const { container } = render(
      <Button visibleWhen={() => true}>shown</Button>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('returns null when visibleWhen returns false', () => {
    const { container } = render(
      <Button visibleWhen={() => false}>hidden</Button>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders normally when visibleWhen is omitted', () => {
    const { container } = render(<Button>always</Button>);
    expect(container.firstChild).toBeTruthy();
  });
});
