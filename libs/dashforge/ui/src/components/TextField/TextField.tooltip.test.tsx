import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TextField } from './TextField';

/**
 * Label-help tooltip on the MUI TextField — the shared
 * `_internal/fieldTooltip` mechanism, rendered through FieldLayoutShell
 * (stacked/inline layouts). The default trigger is a built-in inline SVG.
 */
const TRIGGER = 'button[aria-label="More information"]';

describe('TextField — label tooltip (MUI)', () => {
  it('renders no ⓘ trigger without a tooltip', () => {
    const { container } = render(<TextField name="x" label="Name" layout="stacked" />);
    expect(container.querySelector(TRIGGER)).toBeNull();
  });

  it('string shorthand renders the built-in ⓘ trigger in the label', () => {
    const { container } = render(
      <TextField name="x" label="Name" layout="stacked" tooltip="Legal name" />,
    );
    const btn = container.querySelector(TRIGGER);
    expect(btn).toBeTruthy();
    expect(btn!.querySelector('svg')).toBeTruthy(); // built-in info-circle
  });

  it('a custom icon ReactNode replaces the default glyph', () => {
    const { container, getByTestId } = render(
      <TextField
        name="x"
        label="Name"
        layout="stacked"
        tooltip={{ content: 'x', icon: <span data-testid="ci">i</span> }}
      />,
    );
    expect(getByTestId('ci')).toBeTruthy();
    expect(container.querySelector(TRIGGER)!.querySelector('svg')).toBeNull();
  });

  it('position "before" places the ⓘ before the label text', () => {
    const { container } = render(
      <TextField
        name="x"
        label="Name"
        layout="stacked"
        tooltip={{ content: 'x', position: 'before' }}
      />,
    );
    const labelEl = container.querySelector('label')!;
    const btn = labelEl.querySelector(TRIGGER)!;
    expect(labelEl.firstElementChild).toBe(btn);
  });
});
