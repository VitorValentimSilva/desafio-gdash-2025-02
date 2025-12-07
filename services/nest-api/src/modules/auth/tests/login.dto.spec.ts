import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../dto/login.dto';

describe('LoginDto', () => {
  it('valid data should have no validation errors', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: '123456',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('invalid email and short password should produce errors', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'not-an-email',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    const props = errors.map((e) => e.property);
    expect(props).toEqual(expect.arrayContaining(['email', 'password']));
  });
});
