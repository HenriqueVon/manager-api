import crypto from 'crypto';

export function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  } 
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}