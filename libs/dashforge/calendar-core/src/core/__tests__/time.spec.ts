import { describe, it, expect } from 'vitest';

import {
  formatTime,
  generateTimeOptions,
  minutesToTimeString,
  parseTimeString,
  timeStringToMinutes,
} from '../time.js';

describe('parseTimeString', () => {
  it('normalizes 24-hour input', () => {
    expect(parseTimeString('09:30')).toBe('09:30');
    expect(parseTimeString('9:30')).toBe('09:30');
    expect(parseTimeString('14:05')).toBe('14:05');
    expect(parseTimeString('00:00')).toBe('00:00');
    expect(parseTimeString('9.30')).toBe('09:30');
  });

  it('converts 12-hour input to 24-hour', () => {
    expect(parseTimeString('2:30 pm')).toBe('14:30');
    expect(parseTimeString('2:30 PM')).toBe('14:30');
    expect(parseTimeString('12:00 am')).toBe('00:00');
    expect(parseTimeString('12:00 pm')).toBe('12:00');
    expect(parseTimeString('11:45 am')).toBe('11:45');
  });

  it('rejects invalid input', () => {
    expect(parseTimeString('25:00')).toBeNull();
    expect(parseTimeString('10:70')).toBeNull();
    expect(parseTimeString('13:00 pm')).toBeNull();
    expect(parseTimeString('abc')).toBeNull();
    expect(parseTimeString('')).toBeNull();
  });
});

describe('timeStringToMinutes / minutesToTimeString', () => {
  it('converts both ways', () => {
    expect(timeStringToMinutes('01:30')).toBe(90);
    expect(timeStringToMinutes('00:00')).toBe(0);
    expect(timeStringToMinutes('23:59')).toBe(1439);
    expect(timeStringToMinutes('bad')).toBeNull();
    expect(minutesToTimeString(90)).toBe('01:30');
    expect(minutesToTimeString(0)).toBe('00:00');
  });

  it('wraps minutes across day boundaries', () => {
    expect(minutesToTimeString(1440)).toBe('00:00');
    expect(minutesToTimeString(-30)).toBe('23:30');
  });
});

describe('generateTimeOptions', () => {
  it('generates a default 30-minute grid', () => {
    const options = generateTimeOptions();
    expect(options[0]).toBe('00:00');
    expect(options[1]).toBe('00:30');
    expect(options).toContain('23:30');
    expect(options).toHaveLength(48);
  });

  it('honours a custom range and step', () => {
    expect(generateTimeOptions({ start: '09:00', end: '11:00', stepMinutes: 60 })).toEqual([
      '09:00',
      '10:00',
      '11:00',
    ]);
  });
});

describe('formatTime', () => {
  it('returns 24-hour form by default', () => {
    expect(formatTime('14:30')).toBe('14:30');
  });

  it('renders 12-hour form on request', () => {
    expect(formatTime('14:30', { hour12: true })).toBe('2:30 PM');
    expect(formatTime('00:15', { hour12: true })).toBe('12:15 AM');
    expect(formatTime('12:00', { hour12: true })).toBe('12:00 PM');
  });

  it('returns the input unchanged when unparseable', () => {
    expect(formatTime('nope')).toBe('nope');
  });
});
