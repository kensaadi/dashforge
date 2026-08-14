import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';

/**
 * Unit tests for the MUI `<Grid>` override. Covers the container + item
 * composition, forwarding native `Grid` props (`container`, `size`,
 * `data-*`, `sx`), and the absence of gating attributes when neither
 * `access` nor `visibleWhen` is supplied.
 */
describe('<Grid> (MUI)', () => {
  it('renders a container with item children', () => {
    render(
      <Grid container spacing={2} data-testid="grid-root">
        <Grid size={{ xs: 12, md: 6 }}>
          <span>left</span>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <span>right</span>
        </Grid>
      </Grid>,
    );
    expect(screen.getByTestId('grid-root')).toBeInTheDocument();
    expect(screen.getByText('left')).toBeInTheDocument();
    expect(screen.getByText('right')).toBeInTheDocument();
  });

  it('applies the `sx` prop (emotion class present)', () => {
    const { container } = render(
      <Grid container sx={{ p: 1 }}>
        x
      </Grid>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/css-/);
  });

  it('adds no aria-disabled without access/visibleWhen', () => {
    const { container } = render(<Grid container>x</Grid>);
    expect((container.firstChild as HTMLElement).getAttribute('aria-disabled')).toBeNull();
  });
});
