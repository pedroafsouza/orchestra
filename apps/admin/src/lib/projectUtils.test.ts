import { describe, it, expect, vi } from 'vitest';
import { getGradient, timeAgo, getInitials, GRADIENTS } from './projectUtils';

describe('getGradient', () => {
  it('returns a gradient from the GRADIENTS array', () => {
    const result = getGradient('My Project');
    expect(GRADIENTS).toContain(result);
  });

  it('returns deterministic result for same input', () => {
    expect(getGradient('Test')).toBe(getGradient('Test'));
  });

  it('returns different gradients for different names', () => {
    // Different names should (usually) produce different gradients
    const results = new Set(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'].map(getGradient));
    expect(results.size).toBeGreaterThan(1);
  });

  it('handles empty string without error', () => {
    const result = getGradient('');
    expect(GRADIENTS).toContain(result);
  });
});

describe('timeAgo', () => {
  it('returns "just now" for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('just now');
  });

  it('returns minutes for timestamps < 1 hour ago', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(timeAgo(tenMinAgo)).toBe('10m ago');
  });

  it('returns hours for timestamps < 1 day ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days for timestamps < 30 days ago', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(fiveDaysAgo)).toBe('5d ago');
  });

  it('returns formatted date for timestamps > 30 days ago', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(sixtyDaysAgo);
    // Should be a locale date string, not "Xd ago"
    expect(result).not.toMatch(/d ago/);
  });
});

describe('getInitials', () => {
  it('returns two-letter initials from two words', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns single letter for single word', () => {
    expect(getInitials('Admin')).toBe('A');
  });

  it('takes only first two words', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('uppercases the initials', () => {
    expect(getInitials('hello world')).toBe('HW');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('');
  });
});
