// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Accordion } from './Accordion.js';

void React;
afterEach(() => cleanup());

const items = [
  { value: 'one',   header: 'Section one',   content: <p>One body</p> },
  { value: 'two',   header: 'Section two',   content: <p>Two body</p> },
  { value: 'three', header: 'Section three', content: <p>Three body</p> },
];

function regionIsOpen(bodyText: string): boolean {
  const node = screen.queryByText(bodyText);
  if (!node) return false;
  const region = node.closest('[role="region"]');
  if (!region) return false;
  // Radix sets `hidden` attr on closed regions in jsdom.
  return region.getAttribute('hidden') === null && !(region as HTMLElement).hidden;
}

describe('Accordion — single mode (default)', () => {
  it('renders all triggers', () => {
    render(<Accordion items={items} />);
    expect(screen.queryByText('Section one')).not.toBeNull();
    expect(screen.queryByText('Section two')).not.toBeNull();
    expect(screen.queryByText('Section three')).not.toBeNull();
  });

  it('opens a panel on trigger click', () => {
    render(<Accordion items={items} />);
    expect(regionIsOpen('Two body')).toBe(false);
    fireEvent.click(screen.getByText('Section two'));
    expect(regionIsOpen('Two body')).toBe(true);
  });

  it('closes the open panel when clicked again (collapsible default)', () => {
    render(<Accordion items={items} />);
    const trigger = screen.getByText('Section two');
    fireEvent.click(trigger);
    expect(regionIsOpen('Two body')).toBe(true);
    fireEvent.click(trigger);
    expect(regionIsOpen('Two body')).toBe(false);
  });

  it('respects defaultValue', () => {
    render(<Accordion items={items} defaultValue="three" />);
    expect(regionIsOpen('Three body')).toBe(true);
  });

  it('emits onValueChange', () => {
    let last: string | null = null;
    render(<Accordion items={items} onValueChange={(v) => (last = v)} />);
    fireEvent.click(screen.getByText('Section one'));
    expect(last).toBe('one');
  });
});

describe('Accordion — multiple mode', () => {
  it('allows multiple panels open simultaneously', () => {
    render(<Accordion type="multiple" items={items} defaultValue={['one', 'three']} />);
    expect(regionIsOpen('One body')).toBe(true);
    expect(regionIsOpen('Three body')).toBe(true);
  });

  it('emits onValueChange with the updated array', () => {
    let last: string[] = [];
    render(
      <Accordion
        type="multiple"
        items={items}
        defaultValue={['one']}
        onValueChange={(v) => (last = v)}
      />
    );
    fireEvent.click(screen.getByText('Section two'));
    expect(last).toEqual(expect.arrayContaining(['one', 'two']));
  });
});

describe('Accordion — disabled items', () => {
  it('does not open a disabled section', () => {
    const disabledItems = [
      ...items.slice(0, 2),
      { ...items[2]!, disabled: true },
    ];
    render(<Accordion items={disabledItems} />);
    const trigger = screen.getByText('Section three');
    fireEvent.click(trigger);
    expect(regionIsOpen('Three body')).toBe(false);
  });
});
