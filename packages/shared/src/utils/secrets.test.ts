import { describe, it, expect } from 'vitest';
import { maskSecrets } from './secrets';

describe('maskSecrets', () => {
  it('masks Mapbox public tokens (pk.)', () => {
    const input = 'token: pk.eyJ1IjoibWFwYm94IiwiYSI6ImNrc2';
    const result = maskSecrets(input);
    expect(result).toContain('pk.eyJ');
    expect(result).toContain('****');
    expect(result).not.toContain('ImNrc2');
  });

  it('masks Mapbox secret tokens (sk.)', () => {
    const input = 'secret: sk.eyJ1IjoibWFwYm94IiwiYSI6ImNrc2';
    const result = maskSecrets(input);
    expect(result).toContain('sk.eyJ');
    expect(result).toContain('****');
  });

  it('masks Bearer tokens', () => {
    const input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload';
    const result = maskSecrets(input);
    expect(result).toContain('Bearer');
    expect(result).toContain('****');
    expect(result).not.toContain('payload');
  });

  it('masks multiple secrets in one string', () => {
    const input = 'pk.abcdefghijklmnopqrstuvwxyz and Bearer mytoken1234567890abc';
    const result = maskSecrets(input);
    expect(result).not.toContain('uvwxyz');
    expect(result).not.toContain('890abc');
  });

  it('returns string unchanged when no secrets present', () => {
    const input = 'This is a normal log message with no secrets';
    expect(maskSecrets(input)).toBe(input);
  });

  it('does not mask short tokens that do not meet length requirement', () => {
    const input = 'pk.short';
    expect(maskSecrets(input)).toBe('pk.short');
  });
});
