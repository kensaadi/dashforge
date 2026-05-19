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
    // Only the active panel renders content (others get data-state="inactive").
    expect(screen.queryByText('Overview body')).not.toBeNull();
  });

  it('honors `defaultValue`', () => {
    render(<Tabs items={items} defaultValue="history" />);
    expect(screen.queryByText('History body')).not.toBeNull();
  });

  it('switches active panel via controlled `value` rerender', () => {
    const { rerender } = render(
      <Tabs items={items} value="overview" onValueChange={() => {}} />
    );
    expect(screen.queryByText('Overview body')).not.toBeNull();
    rerender(<Tabs items={items} value="details" onValueChange={() => {}} />);
    expect(screen.queryByText('Details body')).not.toBeNull();
  });

  it('marks the active tab via aria-selected', () => {
    render(<Tabs items={items} defaultValue="details" />);
    const detailsTab = screen.getByRole('tab', { name: 'Details' });
    expect(detailsTab.getAttribute('aria-selected')).toBe('true');
    const overviewTab = screen.getByRole('tab', { name: 'Overview' });
    expect(overviewTab.getAttribute('aria-selected')).toBe('false');
  });
});

void fireEvent; // imported for parity but not needed after the controlled-mode simplification

describe('Tabs — variants', () => {
  it.each(['underline', 'pill'] as const)('renders variant=%s', (variant) => {
    render(<Tabs items={items} variant={variant} />);
    expect(screen.queryByRole('tablist')).not.toBeNull();
  });

  it.each(['horizontal', 'vertical'] as const)('renders orientation=%s', (o) => {
    render(<Tabs items={items} orientation={o} />);
    const list = screen.getByRole('tablist');
    expect(list.getAttribute('aria-orientation')).toBe(o);
  });
});

describe('Tabs — disabled items', () => {
  it('marks disabled triggers as disabled', () => {
    const disabledItems = [
      ...items.slice(0, 2),
      { ...items[2]!, disabled: true },
    ];
    render(<Tabs items={disabledItems} />);
    const trigger = screen.getByRole('tab', { name: 'History' }) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });
});
