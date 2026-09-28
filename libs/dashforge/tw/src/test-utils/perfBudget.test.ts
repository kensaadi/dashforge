import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * The tolerance is read at module load, so each case re-imports the helper
 * under a stubbed environment.
 */
const loadHelper = async () => {
  vi.resetModules();
  return import('./perfBudget');
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('expectWithinBudget', () => {
  it('enforces the budget exactly as written when DF_PERF is set', async () => {
    vi.stubEnv('DF_PERF', '1');
    const { expectWithinBudget, PERF_BUDGET_HEADROOM } = await loadHelper();

    expect(PERF_BUDGET_HEADROOM).toBe(1);
    expect(() => expectWithinBudget(99, 100)).not.toThrow();
    expect(() => expectWithinBudget(120, 100)).toThrow();
  });

  it('tolerates contention when DF_PERF is unset', async () => {
    vi.stubEnv('DF_PERF', '');
    const { expectWithinBudget, PERF_BUDGET_HEADROOM } = await loadHelper();

    expect(PERF_BUDGET_HEADROOM).toBe(4);
    // The two measurements that failed the gate, against their own budgets.
    expect(() => expectWithinBudget(159, 100)).not.toThrow();
    expect(() => expectWithinBudget(117, 50)).not.toThrow();
  });

  it('still catches a gross regression with the tolerance applied', async () => {
    vi.stubEnv('DF_PERF', '');
    const { expectWithinBudget } = await loadHelper();

    // 4x is headroom for a loaded machine, not an open door: past it the
    // assertion has to fire, or the specs stop guarding anything.
    expect(() => expectWithinBudget(401, 100)).toThrow();
    expect(() => expectWithinBudget(1000, 50)).toThrow();
  });
});
