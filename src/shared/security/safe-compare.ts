import crypto from 'crypto';

// Compares two secrets in constant time, whatever their lengths. Both are hashed to the same size first:
// `timingSafeEqual` only accepts buffers of equal length, and returning early when the lengths differ
// would tell a caller how long the expected secret is.
export function safeCompare(a: string, b: string): boolean {
  const aHash = crypto.createHash('sha256').update(a).digest();
  const bHash = crypto.createHash('sha256').update(b).digest();

  return crypto.timingSafeEqual(aHash, bHash);
}
