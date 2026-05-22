import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Tabs } from './Tabs';

const items = [
  { value: 'overview', label: 'Overview', content: <p>Overview body</p> },
  { value: 'details', label: 'Details', content: <p>Details body</p> },
  { value: 'history', label: 'History', content: <p>History body</p> },
];

describe('Tabs', () => {
  it('renders all triggers and the default-active panel', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByText('Overview body')).toBeInTheDocument();
  });

  it('honors defaultValue', () => {
    render(<Tabs items={items} defaultValue="history" />);
    expect(screen.getByText('History body')).toBeInTheDocument();
  });

  it('marks the active tab via aria-selected', () => {
    render(<Tabs items={items} defaultValue="details" />);
    expect(
      screen.getByRole('tab', { name: 'Details' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('tab', { name: 'Overview' }),
    ).toHaveAttribute('aria-selected', 'false');
  });

  it('selects a tab on click and reports the change', () => {
    const onValueChange = vi.fn();
    render(<Tabs items={items} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));
    expect(onValueChange).toHaveBeenCalledWith('details');
    expect(screen.getByText('Details body')).toBeInTheDocument();
  });

  it('keeps a controlled value fixed but still reports the change', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs items={items} value="overview" onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));
    expect(onValueChange).toHaveBeenCalledWith('details');
    expect(screen.getByText('Overview body')).toBeInTheDocument();
  });

  it('exposes aria-orientation on the tablist', () => {
    render(<Tabs items={items} orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('disables a disabled tab', () => {
    const withDisabled = [...items.slice(0, 2), { ...items[2], disabled: true }];
    render(<Tabs items={withDisabled} />);
    expect(screen.getByRole('tab', { name: 'History' })).toBeDisabled();
  });

  it('moves to the next tab with ArrowRight', () => {
    render(<Tabs items={items} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(
      screen.getByRole('tab', { name: 'Details' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps with ArrowRight at the end', () => {
    render(<Tabs items={items} defaultValue="history" />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(
      screen.getByRole('tab', { name: 'Overview' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('jumps with Home / End', () => {
    render(<Tabs items={items} defaultValue="details" />);
    const list = screen.getByRole('tablist');
    fireEvent.keyDown(list, { key: 'End' });
    expect(
      screen.getByRole('tab', { name: 'History' }),
    ).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(list, { key: 'Home' });
    expect(
      screen.getByRole('tab', { name: 'Overview' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled tabs during keyboard navigation', () => {
    const withDisabled = [items[0], { ...items[1], disabled: true }, items[2]];
    render(<Tabs items={withDisabled} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(
      screen.getByRole('tab', { name: 'History' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('mounts only the active panel by default', () => {
    render(<Tabs items={items} defaultValue="overview" />);
    expect(screen.getByText('Overview body')).toBeInTheDocument();
    expect(screen.queryByText('History body')).not.toBeInTheDocument();
  });

  it('keeps every panel mounted when keepMounted is set', () => {
    render(<Tabs items={items} defaultValue="overview" keepMounted />);
    expect(screen.getByText('Overview body')).toBeInTheDocument();
    expect(screen.getByText('History body')).toBeInTheDocument();
  });
});
