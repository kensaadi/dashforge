// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { DashFormContext } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { Stepper } from './Stepper.js';
import { Step } from './Step.js';
import { useStep } from './useStep.js';

/**
 * Minimal in-memory bridge stub. Enough surface for `<Step fields>`
 * validation + `bridge.getError` sync canGoNext readout. Tests that
 * exercise `visibleWhen` closures use an engine-less path (predicate
 * reads local state directly).
 */
function makeBridge(overrides?: Partial<DashFormBridge>): DashFormBridge {
  const errors = new Map<string, string>();
  return {
    engine: { get: () => undefined } as unknown as DashFormBridge['engine'],
    register: () => ({ name: '' }),
    unregister: () => undefined,
    getValue: () => undefined,
    setValue: () => undefined,
    getError: (name: string) =>
      errors.has(name) ? { message: errors.get(name) } : null,
    isTouched: () => false,
    isDirty: () => false,
    submitCount: 0,
    subscribeField: () => () => undefined,
    trigger: async () => true,
    ...overrides,
    // Attach an escape hatch so tests can set errors mid-flow.
    // (Kept off the DashFormBridge type on purpose — tests only.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ['__setError' as any]: (name: string, msg: string | null) => {
      if (msg === null) errors.delete(name);
      else errors.set(name, msg);
    },
  } as DashFormBridge;
}

/** A helper footer that surfaces the useStep API to the test. */
function TestFooter() {
  const step = useStep();
  return (
    <div>
      <span data-testid="current">{step.currentStep}</span>
      <span data-testid="index">{step.currentStepIndex}</span>
      <span data-testid="canGoNext">{step.canGoNext ? 'y' : 'n'}</span>
      <span data-testid="isFirst">{step.isFirstStep ? 'y' : 'n'}</span>
      <span data-testid="isLast">{step.isLastStep ? 'y' : 'n'}</span>
      <span data-testid="visited">
        {[...step.visitedSteps].sort().join(',')}
      </span>
      <span data-testid="errors">{step.errors.map((e) => e.step).join(',')}</span>
      <button data-testid="back" onClick={step.goBack}>Back</button>
      <button data-testid="next" onClick={() => void step.goNext()}>Next</button>
      <button data-testid="reset" onClick={step.reset}>Reset</button>
      <button data-testid="jump-account" onClick={() => step.goToStep('account')}>
        Jump account
      </button>
      <button data-testid="jump-review" onClick={() => step.goToStep('review')}>
        Jump review
      </button>
    </div>
  );
}

describe('<Stepper>', () => {
  describe('base rendering', () => {
    it('walks <Step> children and renders every step in the strip', () => {
      render(
        <Stepper>
          <Step name="a" label="Alpha" />
          <Step name="b" label="Beta" />
          <Step name="c" label="Gamma" />
        </Stepper>,
      );
      expect(screen.getByText('Alpha')).toBeTruthy();
      expect(screen.getByText('Beta')).toBeTruthy();
      expect(screen.getByText('Gamma')).toBeTruthy();
    });

    it('renders only the current step content in the panel', () => {
      render(
        <Stepper>
          <Step name="a" label="Alpha">
            <div data-testid="content-a">alpha content</div>
          </Step>
          <Step name="b" label="Beta">
            <div data-testid="content-b">beta content</div>
          </Step>
        </Stepper>,
      );
      expect(screen.getByTestId('content-a')).toBeTruthy();
      expect(screen.queryByTestId('content-b')).toBeNull();
    });

    it('marks the current step with data-state="current" and the next as pending', () => {
      const { container } = render(
        <Stepper>
          <Step name="a" label="A" />
          <Step name="b" label="B" />
        </Stepper>,
      );
      const items = container.querySelectorAll('[role="listitem"]');
      expect(items[0].getAttribute('data-state')).toBe('current');
      expect(items[1].getAttribute('data-state')).toBe('pending');
    });

    it('ignores non-Step children and dev-warns once', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      render(
        <Stepper>
          <Step name="a" label="A" />
          <div>not a step</div>
          <Step name="b" label="B" />
        </Stepper>,
      );
      expect(screen.getByText('A')).toBeTruthy();
      expect(screen.getByText('B')).toBeTruthy();
      expect(screen.queryByText('not a step')).toBeNull();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('initialStep', () => {
    it('starts on the initial step and pre-marks previous steps visited', () => {
      render(
        <Stepper initialStep="b">
          <Step name="a" label="A" />
          <Step name="b" label="B" />
          <Step name="c" label="C" />
          <TestFooter />
        </Stepper>,
      );
      expect(screen.getByTestId('current').textContent).toBe('b');
      expect(screen.getByTestId('visited').textContent).toBe('a,b');
    });

    it('falls back to the first visible step + warns when initialStep does not match', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      render(
        <Stepper initialStep="missing">
          <Step name="a" label="A" />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      expect(screen.getByTestId('current').textContent).toBe('a');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('visibleWhen filtering', () => {
    it('hides steps whose visibleWhen predicate returns false', () => {
      render(
        <Stepper>
          <Step name="a" label="A" />
          <Step name="b" label="B" visibleWhen={() => false} />
          <Step name="c" label="C" />
        </Stepper>,
      );
      expect(screen.getByText('A')).toBeTruthy();
      expect(screen.queryByText('B')).toBeNull();
      expect(screen.getByText('C')).toBeTruthy();
    });

    it('walks over hidden steps on goNext', async () => {
      render(
        <Stepper>
          <Step name="a" label="A" />
          <Step name="b" label="B" visibleWhen={() => false} />
          <Step name="c" label="C" />
          <TestFooter />
        </Stepper>,
      );
      expect(screen.getByTestId('current').textContent).toBe('a');
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() =>
        expect(screen.getByTestId('current').textContent).toBe('c'),
      );
    });
  });

  describe('goNext / goBack / reset', () => {
    it('advances forward and fires onStepChange', async () => {
      const onStepChange = vi.fn();
      render(
        <Stepper onStepChange={onStepChange}>
          <Step name="a" label="A" />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() =>
        expect(screen.getByTestId('current').textContent).toBe('b'),
      );
      expect(onStepChange).toHaveBeenCalledWith('a', 'b', 'next');
    });

    it('goBack returns to the previous step', async () => {
      render(
        <Stepper initialStep="b">
          <Step name="a" label="A" />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('back'));
      expect(screen.getByTestId('current').textContent).toBe('a');
    });

    it('goBack is a no-op on the first step', () => {
      render(
        <Stepper>
          <Step name="a" label="A" />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('back'));
      expect(screen.getByTestId('current').textContent).toBe('a');
    });

    it('fires onComplete when goNext runs past the last step', async () => {
      const onComplete = vi.fn();
      render(
        <Stepper initialStep="b" onComplete={onComplete}>
          <Step name="a" label="A" />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() => expect(onComplete).toHaveBeenCalled());
    });

    it('reset returns to the initial step and clears errors', async () => {
      render(
        <Stepper initialStep="a">
          <Step name="a" label="A" isValid={() => false} />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() =>
        expect(screen.getByTestId('errors').textContent).toBe('a'),
      );
      fireEvent.click(screen.getByTestId('reset'));
      expect(screen.getByTestId('errors').textContent).toBe('');
      expect(screen.getByTestId('current').textContent).toBe('a');
    });
  });

  describe('fields validation via bridge.trigger', () => {
    it('blocks the transition when bridge.trigger returns false', async () => {
      const trigger = vi.fn().mockResolvedValue(false);
      const bridge = makeBridge({ trigger });
      const onStepInvalid = vi.fn();
      render(
        <DashFormContext.Provider value={bridge}>
          <Stepper onStepInvalid={onStepInvalid}>
            <Step name="a" label="A" fields={['email']} />
            <Step name="b" label="B" />
            <TestFooter />
          </Stepper>
        </DashFormContext.Provider>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() => expect(trigger).toHaveBeenCalledWith(['email']));
      expect(screen.getByTestId('current').textContent).toBe('a');
      expect(screen.getByTestId('errors').textContent).toBe('a');
      expect(onStepInvalid).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'a', reason: 'fields' }),
      );
    });

    it('advances when bridge.trigger returns true', async () => {
      const trigger = vi.fn().mockResolvedValue(true);
      const bridge = makeBridge({ trigger });
      render(
        <DashFormContext.Provider value={bridge}>
          <Stepper>
            <Step name="a" label="A" fields={['email']} />
            <Step name="b" label="B" />
            <TestFooter />
          </Stepper>
        </DashFormContext.Provider>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() =>
        expect(screen.getByTestId('current').textContent).toBe('b'),
      );
    });

    it('canGoNext syncs off bridge.getError', () => {
      const getError = vi.fn().mockImplementation((f: string) =>
        f === 'email' ? { message: 'required' } : null,
      );
      const bridge = makeBridge({ getError });
      render(
        <DashFormContext.Provider value={bridge}>
          <Stepper>
            <Step name="a" label="A" fields={['email']} />
            <TestFooter />
          </Stepper>
        </DashFormContext.Provider>,
      );
      expect(screen.getByTestId('canGoNext').textContent).toBe('n');
    });

    it('skips fields validation + warns when trigger is unavailable', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      // Bridge without trigger — outside a DashForm or with a bare impl.
      render(
        <Stepper>
          <Step name="a" label="A" fields={['email']} />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() =>
        expect(screen.getByTestId('current').textContent).toBe('b'),
      );
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('isValid callback (hybrid AND semantics with fields)', () => {
    it('blocks the transition when isValid returns false', async () => {
      const onStepInvalid = vi.fn();
      render(
        <Stepper onStepInvalid={onStepInvalid}>
          <Step name="a" label="A" isValid={() => false} />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() =>
        expect(screen.getByTestId('errors').textContent).toBe('a'),
      );
      expect(screen.getByTestId('current').textContent).toBe('a');
      expect(onStepInvalid).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'a', reason: 'isValid' }),
      );
    });

    it('runs isValid only when fields passes (AND semantics)', async () => {
      const trigger = vi.fn().mockResolvedValue(false);
      const isValid = vi.fn().mockResolvedValue(true);
      const bridge = makeBridge({ trigger });
      render(
        <DashFormContext.Provider value={bridge}>
          <Stepper>
            <Step name="a" label="A" fields={['email']} isValid={isValid} />
            <Step name="b" label="B" />
            <TestFooter />
          </Stepper>
        </DashFormContext.Provider>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() => expect(trigger).toHaveBeenCalled());
      // isValid should NOT have run because fields failed first.
      expect(isValid).not.toHaveBeenCalled();
    });

    it('async isValid resolving to false blocks + records error', async () => {
      render(
        <Stepper>
          <Step
            name="a"
            label="A"
            isValid={async () => {
              await Promise.resolve();
              return false;
            }}
          />
          <Step name="b" label="B" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() =>
        expect(screen.getByTestId('errors').textContent).toBe('a'),
      );
    });
  });

  describe('goToStep + allowJumpTo', () => {
    it('allows jumping to a visited step under allowJumpTo="visited"', async () => {
      render(
        <Stepper initialStep="review">
          <Step name="account" label="Account" />
          <Step name="card" label="Card" />
          <Step name="review" label="Review" />
          <TestFooter />
        </Stepper>,
      );
      // review → account (account is visited by virtue of initialStep prefix).
      fireEvent.click(screen.getByTestId('jump-account'));
      expect(screen.getByTestId('current').textContent).toBe('account');
    });

    it('blocks jumping to an unvisited step under allowJumpTo="visited"', async () => {
      render(
        <Stepper>
          <Step name="a" label="A" />
          <Step name="account" label="Account" />
          <Step name="review" label="Review" />
          <TestFooter />
        </Stepper>,
      );
      // a is current; review is unvisited.
      fireEvent.click(screen.getByTestId('jump-review'));
      expect(screen.getByTestId('current').textContent).toBe('a');
    });

    it('never allows goToStep under allowJumpTo="none"', () => {
      render(
        <Stepper initialStep="review" allowJumpTo="none">
          <Step name="account" label="Account" />
          <Step name="review" label="Review" />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('jump-account'));
      expect(screen.getByTestId('current').textContent).toBe('review');
    });
  });

  describe('useStep hook', () => {
    it('exposes visibleSteps + errors + goToStep — supports review-step error routing', async () => {
      let captured: ReturnType<typeof useStep> | null = null;
      function Capture() {
        captured = useStep();
        return null;
      }
      render(
        <Stepper initialStep="a">
          <Step name="a" label="A" isValid={() => false} />
          <Step name="b" label="B" />
          <Capture />
          <TestFooter />
        </Stepper>,
      );
      fireEvent.click(screen.getByTestId('next'));
      await waitFor(() => expect(captured?.errors.length).toBe(1));
      const errored = captured?.errors[0];
      expect(errored?.step).toBe('a');
      expect(errored?.reason).toBe('isValid');
    });

    it('throws in dev when used outside a Stepper', () => {
      function Outside() {
        useStep();
        return null;
      }
      // Silence React's console.error for the throw.
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(<Outside />)).toThrow();
      errSpy.mockRestore();
    });
  });

  describe('optional caption', () => {
    it('renders "Optional" for optional={true}', () => {
      render(
        <Stepper>
          <Step name="a" label="A" optional />
        </Stepper>,
      );
      expect(screen.getByText('Optional')).toBeTruthy();
    });

    it('renders a custom node for optional={<node>}', () => {
      render(
        <Stepper>
          <Step name="a" label="A" optional={<span>Skip if remote</span>} />
        </Stepper>,
      );
      expect(screen.getByText('Skip if remote')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('uses role="list" for the strip and role="listitem" for each step', () => {
      const { container } = render(
        <Stepper>
          <Step name="a" label="A" />
          <Step name="b" label="B" />
        </Stepper>,
      );
      expect(container.querySelector('[role="list"]')).toBeTruthy();
      expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(2);
    });

    it('adds descriptive aria-label to each indicator', () => {
      render(
        <Stepper>
          <Step name="a" label="Account" />
        </Stepper>,
      );
      expect(
        screen.getByLabelText('Step 1: Account'),
      ).toBeTruthy();
    });
  });
});
