// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { TopBar, TopBarBrand } from './TopBar.js';

void React;
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#63 gap G — the "brand plus secondary text" block that
 * every consumer was rebuilding in the `start` slot.
 *
 * A **sibling export, not `TopBar.Brand`**, despite the request's wording:
 * this catalog attaches subcomponents as named siblings (`Card` /
 * `CardContent` / `CardActionArea`), and one component doing it differently
 * costs more than matching the punctuation of an issue.
 *
 * The cases worth guarding are the truncation ones. A top bar is a
 * fixed-height row and the case this exists for is an open file path, so a
 * brand that grows instead of ellipsing pushes the `center` and `end` slots
 * out of the bar. That is a layout property, and jsdom does no layout, so
 * what is pinned here is the class contract that produces it.
 */
describe('<TopBarBrand>', () => {
  const root = (ui: React.ReactElement) =>
    render(ui).container.firstElementChild as HTMLElement;

  it('renders the title alone', () => {
    render(<TopBarBrand title="Dashforge" />);

    expect(screen.getByText('Dashforge')).toBeTruthy();
  });

  it('renders logo, title and subtitle together', () => {
    render(
      <TopBarBrand
        logo={<span data-testid="mark">◆</span>}
        title="Dashforge"
        subtitle="src/App.tsx"
      />
    );

    expect(screen.getByTestId('mark')).toBeTruthy();
    expect(screen.getByText('Dashforge')).toBeTruthy();
    expect(screen.getByText('src/App.tsx')).toBeTruthy();
  });

  it('omits the logo and subtitle wrappers when not given', () => {
    const el = root(<TopBarBrand title="Dashforge" />);

    // One child: the text column. No empty span where the mark would be.
    expect(el.children).toHaveLength(1);
    expect(el.textContent).toBe('Dashforge');
  });

  it('carries the classes truncation needs', () => {
    const el = root(<TopBarBrand title="Dashforge" subtitle="a/very/long/path.tsx" />);

    // `min-w-0` on the root and on the text column is what lets `truncate`
    // do anything: a flex item refuses to shrink past its content width
    // without it.
    expect(el.className).toContain('min-w-0');
    const text = el.querySelector('span')!;
    expect(text.className).toContain('min-w-0');

    for (const line of [screen.getByText('Dashforge'), screen.getByText('a/very/long/path.tsx')]) {
      expect(line.className).toContain('truncate');
    }
  });

  it('sits in a start slot that is allowed to shrink', () => {
    // The case above asserts classes and nothing more, and on its own it
    // was a false green: every class was present while the bar still broke,
    // because `TopBar`'s own `start` slot carried `shrink-0` and no
    // descendant can shrink inside an ancestor that refuses to (BUG 42).
    //
    // jsdom does no layout, so the class contract is all that can be
    // checked here. The measurement that actually proves it is in the
    // register: squeezed to 200px, the subtitle goes 203px -> 89px and the
    // `end` slot comes back inside the bar.
    const { container } = render(
      <TopBar start={<TopBarBrand title="Dashforge" subtitle="src/App.tsx" />} />
    );
    const start = container.firstElementChild!.firstElementChild!;

    expect(start.className).toContain('min-w-0');
    expect(start.className.split(/\s+/)).not.toContain('shrink-0');
  });

  it('gives the subtitle a quieter tier than the title', () => {
    render(<TopBarBrand title="Dashforge" subtitle="src/App.tsx" />);

    expect(screen.getByText('Dashforge').className).toContain('text-neutral-900');
    expect(screen.getByText('src/App.tsx').className).toContain('text-neutral-500');
  });

  it('stays off dark: variants, since neutral already inverts', () => {
    const el = root(<TopBarBrand title="Dashforge" subtitle="src/App.tsx" />);

    expect(el.outerHTML).not.toContain('dark:');
  });

  it('takes per-slot class overrides', () => {
    render(
      <TopBarBrand
        title="Dashforge"
        subtitle="src/App.tsx"
        slotProps={{ subtitle: { className: 'text-danger-500' } }}
      />
    );

    expect(screen.getByText('src/App.tsx').className).toContain('text-danger-500');
  });

  it('lets sx win on the root', () => {
    const el = root(<TopBarBrand title="Dashforge" sx="gap-6" />);

    expect(el.className).toContain('gap-6');
    expect(el.className).not.toContain('gap-2');
  });

  it('forwards its ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(<TopBarBrand ref={ref} title="Dashforge" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('drops into a TopBar start slot', () => {
    render(
      <TopBar start={<TopBarBrand title="Dashforge" subtitle="src/App.tsx" />} />
    );

    expect(screen.getByText('Dashforge')).toBeTruthy();
    expect(screen.getByText('src/App.tsx')).toBeTruthy();
  });
});
