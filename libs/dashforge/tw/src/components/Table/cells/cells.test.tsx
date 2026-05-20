// @vitest-environment jsdom
/**
 * Unit tests for the Table cell renderer library — `RenderText`,
 * `RenderTwoLine`, `RenderChip`, `RenderButton`, `RowActionsMenu`.
 *
 * Sprint 6 P4 — these shipped in Sprint 4.1 with only integration
 * coverage (via Table/DataGrid tests). This file exercises them
 * directly, including the RBAC + edge-case branches.
 */
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RenderText } from './RenderText.js';
import { RenderTwoLine } from './RenderTwoLine.js';
import { RenderChip } from './RenderChip.js';
import { RenderButton } from './RenderButton.js';
import { RowActionsMenu } from './RowActionsMenu.js';

void React;
afterEach(() => cleanup());

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
  }
});

describe('RenderText', () => {
  it('renders the value in a span', () => {
    render(<RenderText value="hello" />);
    expect(screen.getByText('hello').tagName).toBe('SPAN');
  });

  it('applies the truncate class when truncate is set', () => {
    render(<RenderText value="long text" truncate />);
    expect(screen.getByText('long text').className).toContain('truncate');
  });

  it('applies the muted neutral color when muted is set', () => {
    render(<RenderText value="dim" muted />);
    expect(screen.getByText('dim').className).toContain('text-neutral-500');
  });

  it('merges a custom className', () => {
    render(<RenderText value="x" className="custom-cls" />);
    expect(screen.getByText('x').className).toContain('custom-cls');
  });

  it('renders nothing extra when no flags are set', () => {
    render(<RenderText value="plain" />);
    const el = screen.getByText('plain');
    expect(el.className).not.toContain('truncate');
    expect(el.className).not.toContain('text-neutral-500');
  });
});

describe('RenderTwoLine', () => {
  it('renders both primary and secondary text', () => {
    render(<RenderTwoLine primary="Jane Doe" secondary="jane@example.com" />);
    expect(screen.getByText('Jane Doe')).not.toBeNull();
    expect(screen.getByText('jane@example.com')).not.toBeNull();
  });

  it('primary is font-medium, secondary is muted + smaller', () => {
    render(<RenderTwoLine primary="P" secondary="S" />);
    expect(screen.getByText('P').className).toContain('font-medium');
    expect(screen.getByText('S').className).toContain('text-neutral-500');
  });

  it('merges a custom className on the wrapper', () => {
    const { container } = render(
      <RenderTwoLine primary="P" secondary="S" className="twoline-cls" />,
    );
    expect(container.firstElementChild?.className).toContain('twoline-cls');
  });
});

describe('RenderChip', () => {
  it('renders children', () => {
    render(<RenderChip>active</RenderChip>);
    expect(screen.getByText('active')).not.toBeNull();
  });

  it('defaults to soft + neutral + sm', () => {
    render(<RenderChip>x</RenderChip>);
    // soft neutral → bg-neutral-100
    expect(screen.getByText('x').className).toContain('bg-neutral-100');
  });

  it.each(['primary', 'success', 'warning', 'danger', 'info', 'secondary'] as const)(
    'renders soft variant for the %s intent',
    (color) => {
      render(<RenderChip color={color}>{color}</RenderChip>);
      expect(screen.getByText(color).className).toContain(`bg-${color}-100`);
    },
  );

  it('renders the solid variant', () => {
    render(
      <RenderChip variant="solid" color="primary">
        solid
      </RenderChip>,
    );
    expect(screen.getByText('solid').className).toContain('bg-primary-500');
  });

  it('renders the outline variant', () => {
    render(
      <RenderChip variant="outline" color="danger">
        outline
      </RenderChip>,
    );
    expect(screen.getByText('outline').className).toContain('border-danger-500');
  });

  it('renders the md size', () => {
    render(
      <RenderChip size="md">md</RenderChip>,
    );
    expect(screen.getByText('md').className).toContain('h-6');
  });

  it('merges a custom className', () => {
    render(<RenderChip className="chip-cls">x</RenderChip>);
    expect(screen.getByText('x').className).toContain('chip-cls');
  });
});

describe('RenderButton', () => {
  it('renders the label inside a button', () => {
    render(<RenderButton label="Edit" />);
    expect(screen.getByRole('button', { name: 'Edit' })).not.toBeNull();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<RenderButton label="Go" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('honors the disabled prop', () => {
    const onClick = vi.fn();
    render(<RenderButton label="Nope" onClick={onClick} disabled />);
    const btn = screen.getByRole('button', { name: 'Nope' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('RowActionsMenu', () => {
  interface Row {
    id: string;
  }
  const row: Row = { id: 'r1' };

  it('renders the default 3-dot trigger', () => {
    render(
      <RowActionsMenu
        row={row}
        actions={[{ label: 'Edit', onClick: () => {} }]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Row actions' })).not.toBeNull();
  });

  it('returns null when there are no visible actions', () => {
    const { container } = render(
      <RowActionsMenu row={row} actions={[]} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('opens the menu and renders the action items', () => {
    render(
      <RowActionsMenu
        row={row}
        actions={[
          { label: 'Edit', onClick: () => {} },
          { label: 'Delete', onClick: () => {}, color: 'danger' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByRole('menuitem', { name: 'Edit' })).not.toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).not.toBeNull();
  });

  it('invokes the action onClick with the row', () => {
    const onClick = vi.fn();
    render(
      <RowActionsMenu row={row} actions={[{ label: 'Edit', onClick }]} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onClick).toHaveBeenCalledWith(row);
  });

  it('filters out actions whose RBAC says hide', () => {
    render(
      <RowActionsMenu
        row={row}
        actions={[
          { label: 'Edit', onClick: () => {} },
          {
            label: 'SecretDelete',
            onClick: () => {},
            access: { onUnauthorized: 'hide' },
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'SecretDelete' })).toBeNull();
  });

  it('renders a disabled action item when action.disabled is set', () => {
    render(
      <RowActionsMenu
        row={row}
        actions={[{ label: 'Edit', onClick: () => {}, disabled: true }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    const item = screen.getByRole('menuitem', { name: 'Edit' }) as HTMLButtonElement;
    expect(item.disabled).toBe(true);
  });

  it('uses a custom trigger when provided', () => {
    render(
      <RowActionsMenu
        row={row}
        actions={[{ label: 'Edit', onClick: () => {} }]}
        trigger={<button type="button">custom-trigger</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'custom-trigger' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Row actions' })).toBeNull();
  });
});
