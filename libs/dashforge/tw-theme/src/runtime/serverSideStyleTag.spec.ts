import { describe, it, expect } from 'vitest';
import {
  defaultTWThemeLight,
  defaultTWThemeDark,
} from '@dashforge/tw-tokens';
import { serverSideStyleTag } from './serverSideStyleTag.js';

describe('serverSideStyleTag', () => {
  it('wraps output in a <style> tag with stable id', () => {
    const out = serverSideStyleTag(defaultTWThemeLight);
    expect(out).toMatch(/^<style id="dashforge-tw-init">/);
    expect(out).toMatch(/<\/style>$/);
  });

  it('scopes CSS to :root[data-dash-tw-theme="<mode>"]', () => {
    expect(serverSideStyleTag(defaultTWThemeLight))
      .toContain(':root[data-dash-tw-theme="light"]{');
    expect(serverSideStyleTag(defaultTWThemeDark))
      .toContain(':root[data-dash-tw-theme="dark"]{');
  });

  it('emits color triplets in RGB format', () => {
    const out = serverSideStyleTag(defaultTWThemeLight);
    expect(out).toContain('--df-tw-color-primary-500:59 130 246');
  });

  it('emits spacing/radius/fontSize values', () => {
    const out = serverSideStyleTag(defaultTWThemeLight);
    expect(out).toContain('--df-tw-spacing-4:1rem');
    expect(out).toContain('--df-tw-radius-md:0.375rem');
    expect(out).toContain('--df-tw-fontSize-base:1rem');
  });

  it('separates declarations with semicolons (no trailing semicolon required)', () => {
    const out = serverSideStyleTag(defaultTWThemeLight);
    // Should not contain double-semicolons or empty declarations
    expect(out).not.toMatch(/;;/);
  });

  it('produces different output for light vs dark on neutral vars', () => {
    const light = serverSideStyleTag(defaultTWThemeLight);
    const dark = serverSideStyleTag(defaultTWThemeDark);
    expect(light).not.toBe(dark);
    expect(light).toContain('"light"');
    expect(dark).toContain('"dark"');
  });

  it('output is a single line (no newlines for inline injection)', () => {
    const out = serverSideStyleTag(defaultTWThemeLight);
    expect(out.includes('\n')).toBe(false);
  });
});
