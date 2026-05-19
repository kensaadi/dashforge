// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Pagination } from './Pagination.js';
import { computePageRange } from './pagination.helpers.js';

void React;
afterEach(() => cleanup());

describe('computePageRange — helper', () => {
  it('returns empty for totalPages=0', () => {
    expect(computePageRange(1, 0, 1, 1)).toEqual([]);
  });

  it('returns [1] for totalPages=1', () => {
    expect(computePageRange(1, 1, 1, 1)).toEqual([1]);
  });

  it('lists all pages when totalPages <= window size', () => {
    expect(computePageRange(1, 5, 1, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('inserts ellipsis on the right when current is near start', () => {
    const r = computePageRange(2, 20, 1, 1);
    expect(r).toContain(1);
    expect(r).toContain(2);
    expect(r).toContain(3);
    expect(r).toContain('ellipsis');
    expect(r).toContain(20);
    expect(r).not.toContain(10);
  });

  it('inserts ellipsis on both sides when current is in the middle', () => {
    const r = computePageRange(10, 20, 1, 1);
    expect(r.filter((x) => x === 'ellipsis').length).toBeGreaterThanOrEqual(1);
    expect(r).toContain(1);
    expect(r).toContain(9);
    expect(r).toContain(10);
    expect(r).toContain(11);
    expect(r).toContain(20);
  });

  it('inserts ellipsis on the left when current is near end', () => {
    const r = computePageRange(19, 20, 1, 1);
    expect(r).toContain(1);
    expect(r).toContain('ellipsis');
    expect(r).toContain(18);
    expect(r).toContain(19);
    expect(r).toContain(20);
  });

  it('respects siblingCount=2', () => {
    const r = computePageRange(10, 20, 2, 1);
    expect(r).toContain(8);
    expect(r).toContain(9);
    expect(r).toContain(10);
    expect(r).toContain(11);
    expect(r).toContain(12);
  });

  it('respects boundaryCount=2', () => {
    const r = computePageRange(10, 20, 1, 2);
    expect(r).toContain(1);
    expect(r).toContain(2);
    expect(r).toContain(19);
    expect(r).toContain(20);
  });
});

describe('Pagination — rendering (default variant)', () => {
  it('renders nav landmark with aria-label', () => {
    render(<Pagination page={1} pageSize={10} totalCount={50} onPageChange={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).not.toBeNull();
  });

  it('renders the "Showing X-Y of Z" summary', () => {
    render(<Pagination page={1} pageSize={10} totalCount={50} onPageChange={() => {}} />);
    expect(screen.getByText(/Showing 1-10 of 50/)).not.toBeNull();
  });

  it('renders correct summary on last page (partial fill)', () => {
    render(<Pagination page={5} pageSize={10} totalCount={47} onPageChange={() => {}} />);
    expect(screen.getByText(/Showing 41-47 of 47/)).not.toBeNull();
  });

  it('marks active page with aria-current=page', () => {
    render(<Pagination page={3} pageSize={10} totalCount={50} onPageChange={() => {}} />);
    const active = screen.getByRole('button', { name: 'Page 3' });
    expect(active.getAttribute('aria-current')).toBe('page');
  });

  it('disables Prev + First on page 1', () => {
    render(<Pagination page={1} pageSize={10} totalCount={50} onPageChange={() => {}} />);
    expect((screen.getByRole('button', { name: 'Previous' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'First' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables Next + Last on last page', () => {
    render(<Pagination page={5} pageSize={10} totalCount={50} onPageChange={() => {}} />);
    expect((screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Last' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Pagination — interactions', () => {
  it('emits onPageChange when a page button is clicked', () => {
    let last = 0;
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={50}
        onPageChange={(p) => (last = p)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(last).toBe(3);
  });

  it('Prev decrements page', () => {
    let last = 0;
    render(
      <Pagination
        page={3}
        pageSize={10}
        totalCount={50}
        onPageChange={(p) => (last = p)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(last).toBe(2);
  });

  it('Next increments page', () => {
    let last = 0;
    render(
      <Pagination
        page={3}
        pageSize={10}
        totalCount={50}
        onPageChange={(p) => (last = p)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(last).toBe(4);
  });

  it('First/Last jump to extremes', () => {
    let last = 0;
    const { rerender } = render(
      <Pagination
        page={3}
        pageSize={10}
        totalCount={50}
        onPageChange={(p) => (last = p)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(last).toBe(1);
    rerender(
      <Pagination
        page={3}
        pageSize={10}
        totalCount={50}
        onPageChange={(p) => (last = p)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Last' }));
    expect(last).toBe(5);
  });

  it('emits onPageSizeChange when selector changes', () => {
    let lastSize = 0;
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={100}
        onPageChange={() => {}}
        onPageSizeChange={(s) => (lastSize = s)}
      />,
    );
    const selector = screen.getByLabelText('per page') as HTMLSelectElement;
    fireEvent.change(selector, { target: { value: '50' } });
    expect(lastSize).toBe(50);
  });

  it('hides page-size selector if onPageSizeChange not provided', () => {
    render(<Pagination page={1} pageSize={10} totalCount={50} onPageChange={() => {}} />);
    expect(screen.queryByLabelText('per page')).toBeNull();
  });
});

describe('Pagination — variants', () => {
  it('compact variant hides summary + selector', () => {
    render(
      <Pagination
        variant="compact"
        page={1}
        pageSize={10}
        totalCount={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />,
    );
    expect(screen.queryByText(/Showing/)).toBeNull();
    expect(screen.queryByLabelText('per page')).toBeNull();
  });

  it('minimal variant shows "Page X of Y" + only Prev/Next', () => {
    render(
      <Pagination
        variant="minimal"
        page={3}
        pageSize={10}
        totalCount={50}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByText(/Page 3 of 5/)).not.toBeNull();
    // Page-number buttons should NOT exist
    expect(screen.queryByRole('button', { name: 'Page 1' })).toBeNull();
    // Prev / Next remain
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeNull();
  });
});

describe('Pagination — i18n', () => {
  it('honors custom labels', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={50}
        onPageChange={() => {}}
        labels={{ showing: 'Mostro', of: 'di', prev: 'Indietro', next: 'Avanti' }}
      />,
    );
    expect(screen.getByText(/Mostro 1-10 di 50/)).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Indietro' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Avanti' })).not.toBeNull();
  });
});

describe('Pagination — disabled', () => {
  it('disables all buttons when disabled=true', () => {
    render(
      <Pagination
        page={3}
        pageSize={10}
        totalCount={50}
        onPageChange={() => {}}
        disabled
      />,
    );
    expect((screen.getByRole('button', { name: 'Previous' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Page 2' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Pagination — sx + slotProps', () => {
  it('applies sx to root', () => {
    const { container } = render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={50}
        onPageChange={() => {}}
        sx="my-custom-root"
      />,
    );
    expect(container.querySelector('nav')!.className).toContain('my-custom-root');
  });

  it('applies slotProps.pageButton.className', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={50}
        onPageChange={() => {}}
        slotProps={{ pageButton: { className: 'slot-page' } }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Page 2' }).className).toContain('slot-page');
  });
});

describe('Pagination — edge cases', () => {
  it('renders correctly with totalCount=0', () => {
    render(<Pagination page={1} pageSize={10} totalCount={0} onPageChange={() => {}} />);
    expect(screen.getByText(/Showing 0-0 of 0/)).not.toBeNull();
    expect((screen.getByRole('button', { name: 'Previous' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('clamps page > totalPages internally without crashing', () => {
    let last = 0;
    render(
      <Pagination
        page={99}
        pageSize={10}
        totalCount={50}
        onPageChange={(p) => (last = p)}
      />,
    );
    // Component computes safePage=5 (last valid). User clicks Prev → goes to 4.
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(last).toBe(4);
  });
});
