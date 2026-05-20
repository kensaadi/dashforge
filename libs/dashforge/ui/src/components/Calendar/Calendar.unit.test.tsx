import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Calendar } from './Calendar';

describe('Calendar', () => {
  it('renders a labelled month grid', () => {
    render(<Calendar today="2026-05-20" />);
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });

  it('renders a fixed 42-cell grid', () => {
    render(<Calendar today="2026-05-20" />);
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('fires onChange when a day is clicked', () => {
    const onChange = vi.fn();
    render(<Calendar today="2026-05-20" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15');
  });

  it('marks the controlled selected day as pressed', () => {
    render(<Calendar today="2026-05-20" value="2026-05-10" />);
    expect(screen.getByRole('button', { name: /May 10, 2026/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('navigates to the next and previous month', () => {
    render(<Calendar today="2026-05-20" />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('June 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  it('moves roving focus with the arrow keys', () => {
    render(<Calendar today="2026-05-20" />);
    const grid = screen.getByRole('grid');
    expect(screen.getByRole('button', { name: /May 20, 2026/ })).toHaveAttribute(
      'tabindex',
      '0',
    );
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: /May 21, 2026/ })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('button', { name: /May 20, 2026/ })).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('does not select a disabled date', () => {
    const onChange = vi.fn();
    render(
      <Calendar today="2026-05-20" minDate="2026-05-15" onChange={onChange} />,
    );
    const blocked = screen.getByRole('button', { name: /May 10, 2026/ });
    expect(blocked).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(blocked);
    expect(onChange).not.toHaveBeenCalled();
  });
});
