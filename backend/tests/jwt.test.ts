import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken } from '../src/utils/jwt';

describe('jwt utils', () => {
  it('signs and verifies an access token', () => {
    const token = signAccessToken({ userId: 'user-1', email: 'a@b.com' });
    const payload = verifyAccessToken(token);

    expect(payload.userId).toBe('user-1');
    expect(payload.email).toBe('a@b.com');
  });

  it('signs and verifies a refresh token with a jti', () => {
    const { token, jti } = signRefreshToken('user-1');
    const payload = verifyRefreshToken(token);

    expect(payload.userId).toBe('user-1');
    expect(payload.jti).toBe(jti);
  });

  it('rejects a tampered access token', () => {
    const token = signAccessToken({ userId: 'user-1', email: 'a@b.com' });
    const tampered = token.slice(0, -2) + 'xx';

    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('hashes tokens deterministically', () => {
    expect(hashToken('same-value')).toBe(hashToken('same-value'));
    expect(hashToken('value-a')).not.toBe(hashToken('value-b'));
  });
});
