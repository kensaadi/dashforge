// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VisuallyHidden } from './VisuallyHidden.js';

describe('<VisuallyHidden>', () => {
  it('renders a <span> by default', () => {
    const { container } = render(<VisuallyHidden>label</VisuallyHidden>);
    expect(container.firstElementChild?.tagName).toBe('SPAN');
  });

  it('has the sr-only class', () => {
    const { container } = render(<VisuallyHidden>label</VisuallyHidden>);
    expect(container.firstElementChild?.className).toContain('sr-only');
  });

  it('preserves the text content (so screen readers can read it)', () => {
    const { container } = render(<VisuallyHidden>Close dialog</VisuallyHidden>);
    expect(container.firstElementChild?.textContent).toBe('Close dialog');
  });

  it('as="div" renders <div>', () => {
    const { container } = render(<VisuallyHidden as="div">label</VisuallyHidden>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('sx adds utilities (merged with sr-only)', () => {
    const { container } = render(
      <VisuallyHidden sx="text-xs">label</VisuallyHidden>,
    );
    const cls = container.firstElementChild?.className ?? '';
    expect(cls).toContain('sr-only');
    expect(cls).toContain('text-xs');
  });

  it('forwards data-* + aria-*', () => {
    const { container } = render(
      <VisuallyHidden data-testid="vh" aria-live="polite">x</VisuallyHidden>,
    );
    const el = container.firstElementChild;
    expect(el?.getAttribute('data-testid')).toBe('vh');
    expect(el?.getAttribute('aria-live')).toBe('polite');
  });

  it('typical pattern — icon button label', () => {
    const { container } = render(
      <button type="button">
        <span aria-hidden="true">✕</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    );
    const btn = container.querySelector('button');
    // textContent includes the hidden label so AT can read it
    expect(btn?.textContent).toBe('✕Close');
    // visually, the Close span has sr-only
    const hidden = btn?.querySelector('.sr-only');
    expect(hidden?.textContent).toBe('Close');
  });
});
