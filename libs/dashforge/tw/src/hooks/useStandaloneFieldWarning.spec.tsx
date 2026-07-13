// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStandaloneFieldWarning } from './useStandaloneFieldWarning.js';

/**
 * Unit tests for the shared standalone-field dev-warning hook.
 * Covers the acceptance criteria on issue #113 (G-29).
 */
describe('useStandaloneFieldWarning', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('warns when standalone AND no value AND no onChange', () => {
    renderHook(() =>
      useStandaloneFieldWarning('TextField', 'firstName', false, undefined, undefined),
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('<TextField name="firstName">');
    expect(warnSpy.mock.calls[0][0]).toContain('DashFormProvider');
    expect(warnSpy.mock.calls[0][0]).toContain('never emit changes');
  });

  it('does NOT warn when in bridge mode (isFormMode=true)', () => {
    renderHook(() =>
      useStandaloneFieldWarning('TextField', 'firstName', true, undefined, undefined),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when a value is provided (controlled mode)', () => {
    renderHook(() =>
      useStandaloneFieldWarning('TextField', 'firstName', false, 'hello', undefined),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when an onChange is provided (controlled mode)', () => {
    renderHook(() =>
      useStandaloneFieldWarning(
        'TextField',
        'firstName',
        false,
        undefined,
        () => undefined,
      ),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when value is null (null is a valid controlled value)', () => {
    // Distinct from `undefined` — a controlled null (e.g. bridge value not
    // yet set) is a real value assignment, not an "unset" prop.
    renderHook(() =>
      useStandaloneFieldWarning('TextField', 'firstName', false, null, undefined),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when value is false (falsy but defined for Switch/Checkbox)', () => {
    renderHook(() =>
      useStandaloneFieldWarning('Switch', 'agree', false, false, undefined),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns at most once across re-renders', () => {
    const { rerender } = renderHook(() =>
      useStandaloneFieldWarning('TextField', 'firstName', false, undefined, undefined),
    );
    rerender();
    rerender();
    rerender();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('renders the message without name segment when name is missing', () => {
    renderHook(() =>
      useStandaloneFieldWarning('Checkbox', undefined, false, undefined, undefined),
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('<Checkbox>');
    expect(warnSpy.mock.calls[0][0]).not.toContain('name=""');
  });

  it('renders the message without name segment when name is an empty string', () => {
    renderHook(() =>
      useStandaloneFieldWarning('Textarea', '', false, undefined, undefined),
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('<Textarea>');
    expect(warnSpy.mock.calls[0][0]).not.toContain('name=""');
  });

  it('is a no-op in production builds', () => {
    vi.stubEnv('NODE_ENV', 'production');
    renderHook(() =>
      useStandaloneFieldWarning('TextField', 'firstName', false, undefined, undefined),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('includes each of the 6 widget names when they miss the guard', () => {
    // Simulates the six wired call sites — smoke-check that the format
    // string composes correctly for every componentName currently in use.
    const widgets = [
      'TextField',
      'NumberField',
      'Textarea',
      'Switch',
      'Checkbox',
      'RadioGroup',
    ] as const;
    for (const name of widgets) {
      warnSpy.mockClear();
      renderHook(() =>
        useStandaloneFieldWarning(name, `field-${name}`, false, undefined, undefined),
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain(`<${name} name="field-${name}">`);
    }
  });
});
