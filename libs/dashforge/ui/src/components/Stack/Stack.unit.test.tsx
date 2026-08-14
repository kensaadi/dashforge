import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';

/**
 * Unit tests for the MUI `<Stack>` override. Covers rendering children,
 * forwarding native `Stack` props (`direction`, `data-*`, `sx`), and the
 * absence of gating attributes when neither `access` nor `visibleWhen` is
 * supplied.
 */
describe('<Stack> (MUI)', () => {
  it('renders its children', () => {
    render(
      <Stack>
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('forwards native attributes (data-*)', () => {
    render(
      <Stack direction="row" data-testid="row">
        x
      </Stack>,
    );
    expect(screen.getByTestId('row')).toBeInTheDocument();
  });

  it('applies the `sx` prop (emotion class present)', () => {
    const { container } = render(<Stack sx={{ p: 1 }}>x</Stack>);
    expect((container.firstChild as HTMLElement).className).toMatch(/css-/);
  });

  it('adds no aria-disabled without access/visibleWhen', () => {
    const { container } = render(<Stack>x</Stack>);
    expect((container.firstChild as HTMLElement).getAttribute('aria-disabled')).toBeNull();
  });
});
