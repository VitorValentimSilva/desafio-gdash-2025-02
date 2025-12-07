import { JwtPayload, JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'testsecret';
    strategy = new JwtStrategy();
  });

  it('validate should return user info mapped from payload', () => {
    const payload: JwtPayload = { sub: '123', email: 'u@u.com', role: 'admin' };
    const validated = strategy.validate(payload);
    expect(validated).toEqual({
      userId: '123',
      email: 'u@u.com',
      role: 'admin',
    });
  });
});
