/**
 * Secret masking utility — prevents API keys from leaking into logs.
 */

const SENSITIVE_PATTERNS = [
  /pk\.[a-zA-Z0-9]{20,}/g, // Mapbox public tokens
  /sk\.[a-zA-Z0-9]{20,}/g, // Mapbox secret tokens
  /Bearer\s+[a-zA-Z0-9._-]+/g, // Bearer tokens
];

export function maskSecrets(input: string): string {
  let masked = input;
  for (const pattern of SENSITIVE_PATTERNS) {
    masked = masked.replace(pattern, (match) => {
      const prefix = match.slice(0, 6);
      return `${prefix}${'*'.repeat(Math.max(match.length - 6, 4))}`;
    });
  }
  return masked;
}
