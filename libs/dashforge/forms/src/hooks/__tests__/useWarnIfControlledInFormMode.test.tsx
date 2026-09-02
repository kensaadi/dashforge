/**
 * Tests for `useWarnIfControlledInFormMode` (in @dashforge/ui-core).
 *
 * Lives in the forms package because we need a real
 * `<DashFormProvider>` to exercise the "in form mode" branch, and
 * that wrapper isn't available inside ui-core (which has no React
 * test target of its own).
 *
 * The hook is the runtime rete that closes BUG 2 for the case the
 * type-side split cannot see — a consumer passes `defaultValue` (or
 * `value` / `onValueChange`) inside `<DashFormProvider>` without a
 * `rules` prop, so TypeScript accepts the standalone mixin variant.
 * The runtime knows the bridge is present and warns.
 */
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { DashFormProvider } from '../../core/DashFormProvider';
// The hook is exported from ui-core; import it there to exercise the
// public surface consumers will use.
import { useWarnIfControlledInFormMode } from '@dashforge/ui-core';

// Dedup is process-wide keyed on `(componentName, name, propKey)`.
// Every test uses a unique componentName so the module-level dedup set
// (which is not exposed) does not swallow warnings across tests.
let nextId = 0;
const uniqueComponent = () => `TestComp_${++nextId}`;

const withProvider = (children: ReactNode) => (
  <DashFormProvider defaultValues={{}}>{children}</DashFormProvider>
);

/**
 * Small test component that invokes the hook and renders nothing.
 * Renders inside `<DashFormProvider>` when a wrapper is given, or
 * bare (standalone mode) when not.
 */
function Consumer({
  componentName,
  name = 'field',
  props,
}: {
  componentName: string;
  name?: string;
  props: Record<string, unknown>;
}) {
  useWarnIfControlledInFormMode(componentName, name, props);
  return null;
}

describe('useWarnIfControlledInFormMode', () => {
  it('fires when defaultValue is passed inside a DashFormProvider', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const component = uniqueComponent();
    render(
      withProvider(<Consumer componentName={component} props={{ defaultValue: ['a'] }} />)
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(`<${component} name="field">`)
    );
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('`defaultValue`'));
    spy.mockRestore();
  });

  it('fires when value is passed inside a DashFormProvider', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      withProvider(<Consumer componentName={uniqueComponent()} props={{ value: 'x' }} />)
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('`value`'));
    spy.mockRestore();
  });

  it('fires when onValueChange is passed inside a DashFormProvider', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      withProvider(
        <Consumer componentName={uniqueComponent()} props={{ onValueChange: () => undefined }} />
      )
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('`onValueChange`'));
    spy.mockRestore();
  });

  it('fires once per prop when multiple controlled props are passed together', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      withProvider(
        <Consumer
          componentName={uniqueComponent()}
          props={{ value: 'x', defaultValue: 'y', onValueChange: () => undefined }}
        />
      )
    );
    // Three separate warnings — one per prop.
    expect(spy).toHaveBeenCalledTimes(3);
    spy.mockRestore();
  });

  it('does NOT fire in standalone mode (no DashFormProvider)', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Consumer componentName={uniqueComponent()} props={{ defaultValue: ['a'] }} />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does NOT fire for props with undefined values', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      withProvider(
        <Consumer
          componentName={uniqueComponent()}
          props={{ value: undefined, defaultValue: undefined, onValueChange: undefined }}
        />
      )
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('dedupes across multiple mounts of the same (component, name, prop)', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const component = uniqueComponent();
    // First mount — fires once.
    const { unmount: unmount1 } = render(
      withProvider(
        <Consumer componentName={component} name="tags" props={{ defaultValue: ['a'] }} />
      )
    );
    expect(spy).toHaveBeenCalledTimes(1);
    unmount1();

    // Second mount, same key — silent (deduped by (component, name, prop)).
    render(
      withProvider(
        <Consumer componentName={component} name="tags" props={{ defaultValue: ['b'] }} />
      )
    );
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('fires distinct warnings for different field names', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const component = uniqueComponent();
    render(
      withProvider(
        <>
          <Consumer componentName={component} name="tags" props={{ defaultValue: ['a'] }} />
          <Consumer componentName={component} name="roles" props={{ defaultValue: ['b'] }} />
        </>
      )
    );
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('fires distinct warnings for different component names on the same field name', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const compA = uniqueComponent();
    const compB = uniqueComponent();
    render(
      withProvider(
        <>
          <Consumer componentName={compA} name="x" props={{ defaultValue: 'a' }} />
          <Consumer componentName={compB} name="x" props={{ defaultValue: 'a' }} />
        </>
      )
    );
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('message names the correct API to use instead', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      withProvider(
        <Consumer componentName={uniqueComponent()} name="tags" props={{ defaultValue: ['a'] }} />
      )
    );
    const message = spy.mock.calls[0][0] as string;
    expect(message).toContain('DashForm defaultValues');
    expect(message).toContain('tags');
    spy.mockRestore();
  });
});
