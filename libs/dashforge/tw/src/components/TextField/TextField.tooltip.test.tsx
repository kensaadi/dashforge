// @vitest-environment jsdom
/**
 * Label-help tooltip on the TW TextField — exercises the shared
 * `_shared/fieldTooltip` mechanism (string shorthand, custom icon,
 * position, and the Option C theme-default deep-merge).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { TextField } from './TextField.js';

afterEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

function renderInForm(ui: React.ReactElement) {
  return render(<DashFormProvider defaultValues={{}}>{ui}</DashFormProvider>);
}

const TRIGGER = 'button[aria-label="More information"]';

describe('TextField — label tooltip', () => {
  it('renders no ⓘ trigger without a tooltip', () => {
    const { container } = renderInForm(<TextField name="x" label="Name" />);
    expect(container.querySelector(TRIGGER)).toBeNull();
  });

  it('string shorthand renders the built-in ⓘ trigger in the label', () => {
    const { container } = renderInForm(<TextField name="x" label="Name" tooltip="Legal name" />);
    const btn = container.querySelector(TRIGGER);
    expect(btn).toBeTruthy();
    expect(container.querySelector('label')!.contains(btn)).toBe(true);
    expect(btn!.querySelector('svg')).toBeTruthy(); // built-in info-circle
  });

  it('a custom icon ReactNode replaces the default glyph', () => {
    const { container, getByTestId } = renderInForm(
      <TextField name="x" label="Name" tooltip={{ content: 'x', icon: <span data-testid="ci">i</span> }} />,
    );
    expect(getByTestId('ci')).toBeTruthy();
    expect(container.querySelector(TRIGGER)!.querySelector('svg')).toBeNull();
  });

  it('position "after" (default) places the ⓘ after the label text', () => {
    const { container } = renderInForm(<TextField name="x" label="Name" tooltip="x" />);
    const label = container.querySelector('label')!;
    const btn = label.querySelector(TRIGGER)!;
    // text node "Name" precedes the trigger
    expect(label.textContent!.startsWith('Name')).toBe(true);
    expect(label.firstChild === btn).toBe(false);
  });

  it('position "before" places the ⓘ before the label text', () => {
    const { container } = renderInForm(
      <TextField name="x" label="Name" tooltip={{ content: 'x', position: 'before' }} />,
    );
    const label = container.querySelector('label')!;
    const btn = label.querySelector(TRIGGER)!;
    // the trigger is the first element in the label
    expect(label.firstElementChild).toBe(btn);
  });

  it('Option C: theme default supplies position, instance supplies content (deep-merge)', () => {
    patchTheme({ components: { TextField: { defaults: { tooltip: { position: 'before' } } } } });
    const { container } = renderInForm(<TextField name="x" label="Name" tooltip="from instance" />);
    const label = container.querySelector('label')!;
    const btn = label.querySelector(TRIGGER)!;
    expect(btn).toBeTruthy();
    expect(label.firstElementChild).toBe(btn); // position came from the theme default
  });
});
