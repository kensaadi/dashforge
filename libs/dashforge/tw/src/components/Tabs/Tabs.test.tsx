// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Tabs } from './Tabs.js';

void React;
afterEach(() => cleanup());

const items = [
  { value: 'overview', label: 'Overview', content: <p>Overview body</p> },
  { value: 'details', label: 'Details', content: <p>Details body</p> },
  { value: 'history', label: 'History', content: <p>History body</p> },
];

describe('Tabs — rendering', () => {
  it('renders all triggers and the default-active content', () => {
    render(<Tabs items={items} />);
    expect(screen.queryByRole('tab', { name: 'Overview' })).not.toBeNull();
    expect(screen.queryByRole('tab', { name: 'Details' })).not.toBeNull();
    expect(screen.queryByRole('tab', { name: 'History' })).not.toBeNull();
    expect(screen.queryByText('Overview body')).not.toBeNull();
  });

  it('honors `defaultValue`', () => {
    render(<Tabs items={items} defaultValue="history" />);
    expect(screen.queryByText('History body')).not.toBeNull();
  });

  it('switches active panel via controlled `value` rerender', () => {
    const { rerender } = render(
      <Tabs items={items} value="overview" onValueChange={() => {}} />,
    );
    expect(screen.queryByText('Overview body')).not.toBeNull();
    rerender(<Tabs items={items} value="details" onValueChange={() => {}} />);
    expect(screen.queryByText('Details body')).not.toBeNull();
  });

  it('marks the active tab via aria-selected', () => {
    render(<Tabs items={items} defaultValue="details" />);
    expect(
      screen.getByRole('tab', { name: 'Details' }).getAttribute('aria-selected'),
    ).toBe('true');
    expect(
      screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected'),
    ).toBe('false');
  });

  it('selects a tab on click', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));
    expect(screen.queryByText('Details body')).not.toBeNull();
  });
});

describe('Tabs — variants', () => {
  it.each(['underline', 'pill'] as const)('renders variant=%s', (variant) => {
    render(<Tabs items={items} variant={variant} />);
    expect(screen.queryByRole('tablist')).not.toBeNull();
  });

  it.each(['horizontal', 'vertical'] as const)('renders orientation=%s', (o) => {
    render(<Tabs items={items} orientation={o} />);
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(o);
  });
});

describe('Tabs — disabled items', () => {
  it('marks disabled triggers as disabled', () => {
    const disabledItems = [...items.slice(0, 2), { ...items[2]!, disabled: true }];
    render(<Tabs items={disabledItems} />);
    const trigger = screen.getByRole('tab', {
      name: 'History',
    }) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it('skips disabled tabs during keyboard navigation', () => {
    const disabledItems = [
      items[0]!,
      { ...items[1]!, disabled: true },
      items[2]!,
    ];
    render(<Tabs items={disabledItems} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    // Overview → (skip disabled Details) → History
    expect(
      screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected'),
    ).toBe('true');
  });
});

describe('Tabs — keyboard', () => {
  it('ArrowRight activates the next tab', () => {
    render(<Tabs items={items} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(
      screen.getByRole('tab', { name: 'Details' }).getAttribute('aria-selected'),
    ).toBe('true');
    expect(screen.queryByText('Details body')).not.toBeNull();
  });

  it('ArrowRight wraps at the end', () => {
    render(<Tabs items={items} defaultValue="history" />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(
      screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('Home / End jump to the first / last tab', () => {
    render(<Tabs items={items} defaultValue="details" />);
    const list = screen.getByRole('tablist');
    fireEvent.keyDown(list, { key: 'End' });
    expect(
      screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected'),
    ).toBe('true');
    fireEvent.keyDown(list, { key: 'Home' });
    expect(
      screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('ArrowDown drives a vertical tablist', () => {
    render(<Tabs items={items} orientation="vertical" />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' });
    expect(
      screen.getByRole('tab', { name: 'Details' }).getAttribute('aria-selected'),
    ).toBe('true');
  });
});

describe('Tabs — keepMounted', () => {
  it('mounts only the active panel by default', () => {
    render(<Tabs items={items} defaultValue="overview" />);
    expect(screen.queryByText('Overview body')).not.toBeNull();
    expect(screen.queryByText('History body')).toBeNull();
  });

  it('keeps every panel mounted when keepMounted is set', () => {
    render(<Tabs items={items} defaultValue="overview" keepMounted />);
    expect(screen.queryByText('Overview body')).not.toBeNull();
    expect(screen.queryByText('History body')).not.toBeNull();
  });
});
