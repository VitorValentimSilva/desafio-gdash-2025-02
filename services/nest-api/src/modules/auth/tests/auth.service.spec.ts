import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService, PublicUser } from '../../users/users.service';
import { InternalServerErrorException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let i18n: Partial<I18nService>;

  beforeEach(async () => {
    usersService = {
      validateCredentials: jest.fn(),
    } as Partial<Record<keyof UsersService, jest.Mock>>;

    jwtService = {
      sign: jest.fn(),
    } as Partial<Record<keyof JwtService, jest.Mock>>;

    i18n = {
      t: jest.fn().mockImplementation((k: string) => k),
    } as Partial<I18nService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('returns null when credentials are invalid', async () => {
      (usersService.validateCredentials as jest.Mock).mockResolvedValue(null);
      const result = await service.validateUser('no@one.com', 'wrong');
      expect(result).toBeNull();
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        'no@one.com',
        'wrong',
      );
    });

    it('returns PublicUser when credentials are valid', async () => {
      const user: PublicUser = { id: '1', email: 'u@e.com', role: 'user' };
      (usersService.validateCredentials as jest.Mock).mockResolvedValue(user);
      const result = await service.validateUser('u@e.com', 'pass');
      expect(result).toEqual(user);
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        'u@e.com',
        'pass',
      );
    });

    it('throws InternalServerErrorException when UsersService throws', async () => {
      (usersService.validateCredentials as jest.Mock).mockRejectedValue(
        new Error('db gone'),
      );
      await expect(service.validateUser('x@y.com', 'p')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        'x@y.com',
        'p',
      );
    });
  });

  describe('login', () => {
    it('returns an access token (calls jwt.sign with correct payload)', () => {
      const user: PublicUser = { id: 'abc', email: 'a@b.c', role: 'admin' };
      (jwtService.sign as jest.Mock).mockReturnValue('signed.token.here');

      const token = service.login(user);
      expect(token).toEqual({ access_token: 'signed.token.here' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it('throws InternalServerErrorException when jwt.sign throws', () => {
      const user: PublicUser = { id: 'abc', email: 'a@b.c', role: 'admin' };
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('sign failed');
      });

      expect(() => service.login(user)).toThrow(InternalServerErrorException);
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
