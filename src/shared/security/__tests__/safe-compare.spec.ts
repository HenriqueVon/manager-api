import { describe, it, expect, vi, afterEach } from 'vitest';
import crypto from 'crypto';
import { safeCompare } from '../safe-compare';

describe('safeCompare', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should accept two equal secrets', () => {
    expect(safeCompare('a-long-enough-api-key', 'a-long-enough-api-key')).toBe(true);
  });

  it('should refuse two different secrets of the same length', () => {
    expect(safeCompare('a-long-enough-api-key', 'a-long-enough-api-kez')).toBe(false);
  });

  it('should refuse secrets of different lengths, even when one is a prefix of the other', () => {
    expect(safeCompare('a-long-enough-api-key', 'a-long-enough-api-key-and-more')).toBe(false);
    expect(safeCompare('a-long-enough-api-key-and-more', 'a-long-enough-api-key')).toBe(false);
    expect(safeCompare('', 'a-long-enough-api-key')).toBe(false);
  });

  it('should handle non-ASCII characters', () => {
    expect(safeCompare('chave-é-ç-日本', 'chave-é-ç-日本')).toBe(true);
    expect(safeCompare('chave-é-ç-日本', 'chave-e-c-日本')).toBe(false);
  });

  it('should always compare buffers of the same size, so the length of the expected value is not revealed', () => {
    const timingSafeEqual = vi.spyOn(crypto, 'timingSafeEqual');

    safeCompare('short', 'a-much-longer-expected-secret-value');

    expect(timingSafeEqual).toHaveBeenCalledTimes(1);
    const [first, second] = timingSafeEqual.mock.calls[0] as [Buffer, Buffer];
    expect(first.length).toBe(second.length);
  });
});
