// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Select } from './Select.js';
import type { SelectOption } from './select.types.js';

const VARIANT_OPTIONS: SelectOption<string>[] = [
  { value: 'solid',   label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost',   label: 'Ghost' },
];

describe('<Select>', () => {
  // ─── Base rendering ───────────────────────────────────────────────
  describe('base rendering', () => {
    it('renders a combobox trigger with placeholder when no value is selected', () => {
      render(
        <Select name="variant" options={VARIANT_OPTIONS} placeholder="Pick one" />,
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeTruthy();
      expect(trigger.textContent).toContain('Pick one');
    });

    it('applies size + layout defaults (md + stacked)', () => {
      const { container } = render(<Select name="x" options={VARIANT_OPTIONS} />);
      const trigger = container.querySelector('button[role="combobox"]');
      const cls = trigger?.className ?? '';
      expect(cls).toContain('h-10');   // size md
      expect(cls).toContain('text-base');
    });

    it('renders the label + required marker when provided', () => {
      render(<Select name="x" label="Variant" required options={VARIANT_OPTIONS} />);
      const label = screen.getByText('Variant');
      expect(label).toBeTruthy();
      // The required marker is a sibling *.
      expect(label.parentElement?.textContent).toContain('*');
    });
  });

  // ─── Popover open / close ─────────────────────────────────────────
  describe('popover', () => {
    it('opens on trigger click and lists the options', () => {
      render(<Select name="x" options={VARIANT_OPTIONS} />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeTruthy();
      for (const opt of VARIANT_OPTIONS) {
        expect(screen.getByRole('option', { name: opt.label as string })).toBeTruthy();
      }
    });

    it('renders the empty state when options is []', () => {
      render(<Select name="x" options={[]} emptyState="Nothing here" />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Nothing here')).toBeTruthy();
    });
  });

  // ─── Selection (single) ───────────────────────────────────────────
  describe('single-select', () => {
    it('commits the selection and closes the popover', () => {
      const onChange = vi.fn();
      render(
        <Select
          name="variant"
          options={VARIANT_OPTIONS}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'Outline' }));

      // Two-arg callback: (value, option)
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('outline', VARIANT_OPTIONS[1]);
      // Popover closed.
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('displays the selected label in the trigger (controlled)', () => {
      render(
        <Select
          name="variant"
          options={VARIANT_OPTIONS}
          value="ghost"
          onChange={() => undefined}
        />,
      );
      expect(screen.getByRole('combobox').textContent).toContain('Ghost');
    });

    it('respects defaultValue for uncontrolled usage', () => {
      render(
        <Select
          name="variant"
          options={VARIANT_OPTIONS}
          defaultValue="solid"
        />,
      );
      expect(screen.getByRole('combobox').textContent).toContain('Solid');
    });

    it('skips a disabled option on click', () => {
      const opts: SelectOption<string>[] = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      const onChange = vi.fn();
      render(<Select name="x" options={opts} onChange={onChange} />);
      fireEvent.click(screen.getByRole('combobox'));
      // The disabled option renders with aria-disabled — clicking should not commit.
      fireEvent.click(screen.getByRole('option', { name: 'B' }));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ─── Multi-select ─────────────────────────────────────────────────
  describe('multi-select', () => {
    it('accumulates values and keeps the popover open', () => {
      const onChange = vi.fn();
      render(
        <Select
          name="tags"
          multiple
          defaultValue={[]}
          options={VARIANT_OPTIONS}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'Solid' }));

      // Multi onChange signature: (values, options)
      const call = onChange.mock.calls[0];
      expect(call[0]).toEqual(['solid']);
      expect(call[1][0].value).toBe('solid');
      // Popover stays open.
      expect(screen.getByRole('listbox')).toBeTruthy();
    });

    it('toggles a value off when re-selected', () => {
      const onChange = vi.fn();
      render(
        <Select
          name="tags"
          multiple
          value={['solid', 'outline']}
          options={VARIANT_OPTIONS}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'Outline' }));
      expect(onChange.mock.calls[0][0]).toEqual(['solid']);
    });

    it('renders chips for each selected option', () => {
      render(
        <Select
          name="tags"
          multiple
          value={['solid', 'ghost']}
          options={VARIANT_OPTIONS}
          onChange={() => undefined}
        />,
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger.textContent).toContain('Solid');
      expect(trigger.textContent).toContain('Ghost');
      expect(trigger.textContent).not.toContain('Outline');
    });
  });

  // ─── Keyboard ─────────────────────────────────────────────────────
  describe('keyboard navigation', () => {
    it('ArrowDown opens the popover and moves focus to the first option', () => {
      render(<Select name="x" options={VARIANT_OPTIONS} />);
      const trigger = screen.getByRole('combobox');
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      // Popover open.
      expect(screen.getByRole('listbox')).toBeTruthy();
      // First option is data-focused.
      const first = screen.getByRole('option', { name: 'Solid' });
      expect(first.getAttribute('data-focused')).toBe('true');
    });

    it('Enter on a focused option commits it', () => {
      const onChange = vi.fn();
      render(
        <Select name="x" options={VARIANT_OPTIONS} onChange={onChange} />,
      );
      const trigger = screen.getByRole('combobox');
      fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // open + focus Solid
      fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // focus Outline
      fireEvent.keyDown(trigger, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('outline', VARIANT_OPTIONS[1]);
    });

    it('Escape closes the open popover', () => {
      render(<Select name="x" options={VARIANT_OPTIONS} />);
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeTruthy();
      fireEvent.keyDown(trigger, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('first-letter type-ahead jumps to the matching option', () => {
      render(<Select name="x" options={VARIANT_OPTIONS} />);
      const trigger = screen.getByRole('combobox');
      // 'o' should focus Outline.
      fireEvent.keyDown(trigger, { key: 'o' });
      const outline = screen.getByRole('option', { name: 'Outline' });
      expect(outline.getAttribute('data-focused')).toBe('true');
    });
  });

  // ─── Disabled / error states ──────────────────────────────────────
  describe('states', () => {
    it('disabled trigger blocks click open', () => {
      render(<Select name="x" options={VARIANT_OPTIONS} disabled />);
      const trigger = screen.getByRole('combobox');
      expect((trigger as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(trigger);
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('error prop wires aria-invalid + applies danger border', () => {
      const { container } = render(
        <Select name="x" options={VARIANT_OPTIONS} error helperText="Required" />,
      );
      const trigger = container.querySelector('button[role="combobox"]') as HTMLElement;
      expect(trigger.getAttribute('aria-invalid')).toBe('true');
      expect(trigger.className).toContain('border-danger-500');
    });
  });

  // ─── Escape hatches ───────────────────────────────────────────────
  describe('escape hatches', () => {
    it('sx appends to the trigger class chain', () => {
      const { container } = render(
        <Select name="x" options={VARIANT_OPTIONS} sx="tracking-wide" />,
      );
      const trigger = container.querySelector('button[role="combobox"]');
      expect(trigger?.className).toContain('tracking-wide');
    });

    it('slotProps.trigger.className merges into the trigger', () => {
      const { container } = render(
        <Select
          name="x"
          options={VARIANT_OPTIONS}
          slotProps={{ trigger: { className: 'w-40' } }}
        />,
      );
      const trigger = container.querySelector('button[role="combobox"]');
      expect(trigger?.className).toContain('w-40');
    });
  });

  // ─── Standalone dev-warn (#113) ───────────────────────────────────
  it('#113: warns when standalone widget renders without value/onChange', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Select name="loose" options={VARIANT_OPTIONS} />);
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls[0][0] as string;
    expect(message).toContain('<Select name="loose">');
    warnSpy.mockRestore();
  });

  // ─── numeric V inference ──────────────────────────────────────────
  it('accepts numeric option values (V = number)', () => {
    type Opt = SelectOption<number>;
    const opts: Opt[] = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];
    const onChange = vi.fn();
    render(
      <Select<number>
        name="num"
        options={opts}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Two' }));
    expect(onChange).toHaveBeenCalledWith(2, opts[1]);
  });
});
