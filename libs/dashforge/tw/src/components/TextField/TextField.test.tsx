// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { DashFormProvider } from '@dashforge/forms';
import { TextField } from './TextField.js';

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

describe('TextField — standalone', () => {
  it('renders an <input type="text"> by default', () => {
    const { getByRole } = render(<TextField name="email" label="Email" />);
    const input = getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('label is wired via htmlFor to the input id', () => {
    const { getByText, getByRole } = render(<TextField name="x" label="My label" />);
    const label = getByText('My label').closest('label') as HTMLLabelElement;
    expect(label.htmlFor).toBe((getByRole('textbox') as HTMLInputElement).id);
  });

  it('renders the required asterisk and sets the native required attr', () => {
    const { getByText, getByRole } = render(
      <TextField name="x" label="X" required />
    );
    expect(getByText('*')).toBeTruthy();
    expect((getByRole('textbox') as HTMLInputElement).required).toBe(true);
  });

  it('forwards type="password" / "email" / etc.', () => {
    const { getByLabelText } = render(<TextField name="p" label="P" type="password" />);
    expect((getByLabelText('P') as HTMLInputElement).type).toBe('password');
  });

  it('renders helperText below the input', () => {
    const { getByText } = render(<TextField name="x" label="X" helperText="Hint" />);
    expect(getByText('Hint')).toBeTruthy();
  });

  it('aria-describedby links to the helper text id when present', () => {
    const { getByRole, getByText } = render(
      <TextField name="x" label="X" helperText="Hint" />
    );
    const input = getByRole('textbox') as HTMLInputElement;
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(getByText('Hint').id).toBe(helperId);
  });
});

describe('TextField — variants', () => {
  it('size lg uses h-12 + text-lg', () => {
    const { container } = render(<TextField name="x" label="X" size="lg" />);
    const wrap = container.querySelector('div[class*="rounded-md"]');
    expect(wrap?.className).toContain('h-12');
    expect(container.querySelector('input')?.className).toContain('text-lg');
  });

  it('error=true applies danger ring + uses errorText slot for helperText', () => {
    const { container, getByText } = render(
      <TextField name="x" label="X" error helperText="Bad" />
    );
    expect(container.querySelector('div[class*="rounded-md"]')?.className).toContain(
      'border-danger-500'
    );
    expect(getByText('Bad').className).toContain('text-danger-600');
  });

  it('aria-invalid is set when error=true', () => {
    const { getByRole } = render(<TextField name="x" label="X" error />);
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  });

  it('fullWidth adds w-full to root + wrapper', () => {
    const { container } = render(<TextField name="x" label="X" fullWidth />);
    expect((container.firstChild as HTMLElement).className).toContain('w-full');
  });

  it('layout=inline puts label and input side by side', () => {
    const { container } = render(<TextField name="x" label="X" layout="inline" />);
    expect((container.firstChild as HTMLElement).className).toContain('flex-row');
  });
});

describe('TextField — override (sx + slotProps)', () => {
  it('sx is applied to root', () => {
    const { container } = render(<TextField name="x" label="X" sx="md:w-1/2" />);
    expect((container.firstChild as HTMLElement).className).toContain('md:w-1/2');
  });

  it('slotProps.input applies to the <input>', () => {
    const { getByRole } = render(
      <TextField name="x" label="X" slotProps={{ input: { className: 'font-mono' } }} />
    );
    expect(getByRole('textbox').className).toContain('font-mono');
  });

  it('slotProps.label applies to the <label>', () => {
    const { getByText } = render(
      <TextField name="x" label="My" slotProps={{ label: { className: 'uppercase' } }} />
    );
    const label = getByText('My').closest('label');
    expect(label?.className).toContain('uppercase');
  });
});

describe('TextField — RBAC', () => {
  it('hides with onUnauthorized=hide', () => {
    const { queryByRole } = render(
      <RbacProvider policy={READ_ONLY} subject={viewer}>
        <TextField
          name="x"
          label="X"
          access={{ resource: 'doc', action: 'update', onUnauthorized: 'hide' }}
        />
      </RbacProvider>
    );
    expect(queryByRole('textbox')).toBeNull();
  });

  it('disables with onUnauthorized=disable', () => {
    const { getByRole } = render(
      <RbacProvider policy={READ_ONLY} subject={viewer}>
        <TextField
          name="x"
          label="X"
          access={{ resource: 'doc', action: 'update', onUnauthorized: 'disable' }}
        />
      </RbacProvider>
    );
    expect((getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
  });

  it('becomes readonly with onUnauthorized=readonly', () => {
    const { getByRole } = render(
      <RbacProvider policy={READ_ONLY} subject={viewer}>
        <TextField
          name="x"
          label="X"
          access={{ resource: 'doc', action: 'update', onUnauthorized: 'readonly' }}
        />
      </RbacProvider>
    );
    expect((getByRole('textbox') as HTMLInputElement).readOnly).toBe(true);
  });
});

describe('TextField — DashFormProvider integration', () => {
  it('renders inside DashFormProvider', () => {
    const { getByRole } = render(withForm(<TextField name="email" label="Email" />));
    expect(getByRole('textbox')).toBeTruthy();
  });

  it('updates the input value as the user types', () => {
    const { getByRole } = render(withForm(<TextField name="email" label="Email" />));
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hi@example.com' } });
    expect(input.value).toBe('hi@example.com');
  });

  it('respects explicit `value` (controlled mode wins over bridge)', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      withForm(
        <TextField name="email" label="Email" value="forced" onChange={onChange} />,
        { email: '' }
      )
    );
    expect((getByRole('textbox') as HTMLInputElement).value).toBe('forced');
  });

  it('fires user onChange in addition to the bridge update', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      withForm(<TextField name="email" label="Email" onChange={onChange} />)
    );
    fireEvent.change(getByRole('textbox'), { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalled();
  });
});
