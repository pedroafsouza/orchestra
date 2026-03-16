import { describe, it, expect } from 'vitest';
import { evaluateCondition } from './condition';

describe('evaluateCondition', () => {
  describe('comparison operators', () => {
    it('evaluates == with numbers', () => {
      expect(evaluateCondition('age == 18', { age: 18 })).toBe(true);
      expect(evaluateCondition('age == 18', { age: 19 })).toBe(false);
    });

    it('evaluates != with numbers', () => {
      expect(evaluateCondition('age != 18', { age: 19 })).toBe(true);
      expect(evaluateCondition('age != 18', { age: 18 })).toBe(false);
    });

    it('evaluates > with numbers', () => {
      expect(evaluateCondition('age > 18', { age: 21 })).toBe(true);
      expect(evaluateCondition('age > 18', { age: 18 })).toBe(false);
    });

    it('evaluates < with numbers', () => {
      expect(evaluateCondition('age < 18', { age: 15 })).toBe(true);
      expect(evaluateCondition('age < 18', { age: 18 })).toBe(false);
    });

    it('evaluates >= with numbers', () => {
      expect(evaluateCondition('age >= 18', { age: 18 })).toBe(true);
      expect(evaluateCondition('age >= 18', { age: 17 })).toBe(false);
    });

    it('evaluates <= with numbers', () => {
      expect(evaluateCondition('age <= 18', { age: 18 })).toBe(true);
      expect(evaluateCondition('age <= 18', { age: 19 })).toBe(false);
    });
  });

  describe('string literals', () => {
    it('compares with single-quoted strings', () => {
      expect(evaluateCondition("role == 'admin'", { role: 'admin' })).toBe(true);
      expect(evaluateCondition("role == 'admin'", { role: 'user' })).toBe(false);
    });

    it('compares with double-quoted strings', () => {
      expect(evaluateCondition('role == "admin"', { role: 'admin' })).toBe(true);
    });
  });

  describe('boolean and null literals', () => {
    it('compares with true', () => {
      expect(evaluateCondition('active == true', { active: true })).toBe(true);
    });

    it('compares with false', () => {
      expect(evaluateCondition('active == false', { active: false })).toBe(true);
    });

    it('compares with null', () => {
      expect(evaluateCondition('val == null', { val: null })).toBe(true);
    });
  });

  describe('nested context paths', () => {
    it('resolves nested properties', () => {
      expect(evaluateCondition('user.age > 18', { user: { age: 21 } })).toBe(true);
    });

    it('returns false for missing nested paths', () => {
      expect(evaluateCondition('user.age > 18', {})).toBe(false);
    });
  });

  describe('logical operators', () => {
    it('evaluates AND (&&)', () => {
      expect(evaluateCondition('age > 18 && active == true', { age: 21, active: true })).toBe(true);
      expect(evaluateCondition('age > 18 && active == true', { age: 21, active: false })).toBe(false);
    });

    it('evaluates OR (||)', () => {
      expect(evaluateCondition('isAdmin == true || isPremium == true', { isAdmin: false, isPremium: true })).toBe(true);
      expect(evaluateCondition('isAdmin == true || isPremium == true', { isAdmin: false, isPremium: false })).toBe(false);
    });

    it('OR has lower precedence than AND', () => {
      // "a || b && c" => "a || (b && c)" because || is split first
      expect(evaluateCondition('x == true || y == true && z == true', { x: true, y: false, z: false })).toBe(true);
    });
  });

  describe('truthy checks', () => {
    it('returns true for truthy values', () => {
      expect(evaluateCondition('isAdmin', { isAdmin: true })).toBe(true);
      expect(evaluateCondition('name', { name: 'Alice' })).toBe(true);
      expect(evaluateCondition('count', { count: 1 })).toBe(true);
    });

    it('returns false for falsy values', () => {
      expect(evaluateCondition('isAdmin', { isAdmin: false })).toBe(false);
      expect(evaluateCondition('missing', {})).toBe(false);
      expect(evaluateCondition('val', { val: 0 })).toBe(false);
      expect(evaluateCondition('val', { val: '' })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles extra whitespace', () => {
      expect(evaluateCondition('  age  >  18  ', { age: 21 })).toBe(true);
    });

    it('handles empty condition', () => {
      expect(evaluateCondition('', {})).toBe(false);
    });
  });
});
