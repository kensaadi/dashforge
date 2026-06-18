import { describe, it, expect } from 'vitest';
import {
  getSeverityClasses,
  getSeverityRole,
} from './severityVariants.js';
import { SEVERITY_DEFAULT_ICON } from './severityIcons.js';
import type { Severity, SeverityVariant } from './severity.types.js';

/**
 * Exhaustive coverage of the 3×4 severity matrix.
 *
 * The matrix is the foundation every severity-aware component reads
 * from. Regressions here ripple through Alert, Snackbar, future
 * Banner, etc. — so we lock down every cell, the role helper, and the
 * default-icon map.
 */

const SEVERITIES: Severity[] = ['info', 'success', 'warning', 'danger'];
const VARIANTS: SeverityVariant[] = ['standard', 'filled', 'outlined'];

describe('getSeverityClasses', () => {
  it('returns a SeverityClasses object for every (variant, severity) pair', () => {
    for (const variant of VARIANTS) {
      for (const severity of SEVERITIES) {
        const classes = getSeverityClasses(variant, severity);
        expect(classes).toBeDefined();
        expect(typeof classes.surface).toBe('string');
        expect(typeof classes.border).toBe('string');
        expect(typeof classes.icon).toBe('string');
        expect(classes.surface.length).toBeGreaterThan(0);
        expect(classes.border.length).toBeGreaterThan(0);
        expect(classes.icon.length).toBeGreaterThan(0);
      }
    }
  });

  it('uses token-driven color utilities (no hardcoded hex, no dark: variants)', () => {
    for (const variant of VARIANTS) {
      for (const severity of SEVERITIES) {
        const classes = getSeverityClasses(variant, severity);
        const all = `${classes.surface} ${classes.border} ${classes.icon}`;
        // No hex literals
        expect(all).not.toMatch(/#[0-9a-fA-F]{3,8}/);
        // No dark: variants — preset auto-inverts neutral via CSS var swap
        expect(all).not.toMatch(/\bdark:/);
        // Severity palette names appear in the utilities
        if (severity === 'info' || severity === 'success' || severity === 'warning' || severity === 'danger') {
          expect(all).toContain(severity);
        }
      }
    }
  });

  describe('standard variant — tinted soft surface', () => {
    it.each(SEVERITIES)('uses bg-<severity>-50 + text-<severity>-900 for %s', (sev) => {
      const { surface } = getSeverityClasses('standard', sev);
      expect(surface).toContain(`bg-${sev}-50`);
      expect(surface).toContain(`text-${sev}-900`);
    });

    it.each(SEVERITIES)('uses border-<severity>-100 for %s', (sev) => {
      const { border } = getSeverityClasses('standard', sev);
      expect(border).toContain(`border-${sev}-100`);
    });

    it.each(SEVERITIES)('uses text-<severity>-600 for icon in %s', (sev) => {
      const { icon } = getSeverityClasses('standard', sev);
      expect(icon).toContain(`text-${sev}-600`);
    });
  });

  describe('filled variant — solid colored surface', () => {
    it.each(SEVERITIES)('uses bg-<severity>-600 + text-<severity>-50 for %s', (sev) => {
      const { surface } = getSeverityClasses('filled', sev);
      expect(surface).toContain(`bg-${sev}-600`);
      expect(surface).toContain(`text-${sev}-50`);
    });

    it.each(SEVERITIES)('uses border-<severity>-700 for %s', (sev) => {
      const { border } = getSeverityClasses('filled', sev);
      expect(border).toContain(`border-${sev}-700`);
    });

    it.each(SEVERITIES)('icon inherits the light tone (text-<severity>-50) for %s', (sev) => {
      const { icon } = getSeverityClasses('filled', sev);
      expect(icon).toContain(`text-${sev}-50`);
    });
  });

  describe('outlined variant — transparent surface', () => {
    it.each(SEVERITIES)('uses bg-transparent + text-<severity>-700 for %s', (sev) => {
      const { surface } = getSeverityClasses('outlined', sev);
      expect(surface).toContain('bg-transparent');
      expect(surface).toContain(`text-${sev}-700`);
    });

    it.each(SEVERITIES)('uses border-<severity>-300 for %s', (sev) => {
      const { border } = getSeverityClasses('outlined', sev);
      expect(border).toContain(`border-${sev}-300`);
    });
  });

  it('never reuses primary-* for info severity (info has its own token scale)', () => {
    // Regression: Snackbar 1.0.x aliased `info` to `primary-*`. The
    // shared foundation MUST use the dedicated `info-*` scale so a
    // patchTheme({ info: … }) call does not bleed into primary.
    for (const variant of VARIANTS) {
      const classes = getSeverityClasses(variant, 'info');
      const all = `${classes.surface} ${classes.border} ${classes.icon}`;
      expect(all).not.toMatch(/\bprimary-/);
      expect(all).toContain('info-');
    }
  });
});

describe('getSeverityRole', () => {
  it('returns "alert" for assertive severities (warning, danger)', () => {
    expect(getSeverityRole('warning')).toBe('alert');
    expect(getSeverityRole('danger')).toBe('alert');
  });

  it('returns "status" for polite severities (info, success)', () => {
    expect(getSeverityRole('info')).toBe('status');
    expect(getSeverityRole('success')).toBe('status');
  });
});

describe('SEVERITY_DEFAULT_ICON', () => {
  it('exposes a default icon component for every severity', () => {
    for (const sev of SEVERITIES) {
      const Icon = SEVERITY_DEFAULT_ICON[sev];
      expect(Icon).toBeDefined();
      expect(typeof Icon).toBe('function');
    }
  });
});
