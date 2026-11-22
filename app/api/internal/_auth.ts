import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

export function validateApiKey(req: NextRequest): boolean {
  const key = req.headers.get('X-API-Key');
  const expected = process.env.INTERNAL_API_KEY;

  // Fail closed: reject if the server key is missing or trivially weak,
  // or if the client sent nothing.
  if (!expected || expected.length < 16 || !key) {
    return false;
  }

  const keyBuf = Buffer.from(key);
  const expectedBuf = Buffer.from(expected);
  if (keyBuf.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(keyBuf, expectedBuf);
}
