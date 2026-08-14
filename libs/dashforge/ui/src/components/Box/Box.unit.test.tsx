import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box } from './Box';

/**
 * Unit tests for the MUI `<Box>` override. Covers that it renders
 * children, forwards native MUI props (`component`, `data-*`, `className`,
 * `sx`), and adds no gating attributes when neither `access` nor
 * `visibleWhen` is supplied (behaves like a plain MUI `Box`).
 */
describe('<Box> (MUI)', () => {
  it('renders its children', () => {
    render(<Box>hello</Box>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('forwards the polymorphic `component` prop', () => {
    const { container } = render(<Box component="section">x</Box>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('forwards native attributes (data-*, className)', () => {
    const { container } = render(
      <Box data-testid="panel" className="my-panel">
        x
      </Box>,
    );
    const el = screen.getByTestId('panel');
    expect(el).toBeInTheDocument();
    expect(container.querySelector('.my-panel')).toBe(el);
  });

  it('applies the `sx` prop (emotion class present)', () => {
    const { container } = render(<Box sx={{ p: 2 }}>x</Box>);
    // sx compiles to an emotion-generated class on the root element.
    expect((container.firstChild as HTMLElement).className).toMatch(/css-/);
  });

  it('adds no aria-disabled without access/visibleWhen', () => {
    const { container } = render(<Box>x</Box>);
    expect((container.firstChild as HTMLElement).getAttribute('aria-disabled')).toBeNull();
  });
});
