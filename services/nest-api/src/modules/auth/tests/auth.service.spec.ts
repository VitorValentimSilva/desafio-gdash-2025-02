import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService, PublicUser } from '../../users/users.service';
import { InternalServerErrorException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { mapToResponse } from '../../users/utils/user.mapper';

jest.mock('../../users/utils/user.mapper', () => ({
  mapToResponse: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let i18n: Partial<I18nService>;

  beforeEach(async () => {
    usersService = {
      validateCredentials: jest.fn(),
      findById: jest.fn(),
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

    (mapToResponse as jest.Mock).mockReset();
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
    it('returns access token and fallback user when findById returns null', async () => {
      const user: PublicUser = { id: 'abc', email: 'a@b.c', role: 'admin' };
      (jwtService.sign as jest.Mock).mockReturnValue('signed.token.here');
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      const token = await service.login(user);
      const now = Date.now();

      expect(token.access_token).toBe('signed.token.here');

      expect(token.user).toMatchObject({
        id: user.id,
        email: user.email,
        role: user.role,
        active: true,
        name: undefined,
        bio: undefined,
        location: undefined,
        photo: undefined,
      });

      expect(token.user.createdAt).toBeInstanceOf(Date);
      expect(token.user.updatedAt).toBeInstanceOf(Date);

      const createdAtMs = token.user.createdAt.getTime();
      const updatedAtMs = token.user.updatedAt.getTime();

      expect(Math.abs(now - createdAtMs)).toBeLessThanOrEqual(1000);
      expect(Math.abs(now - updatedAtMs)).toBeLessThanOrEqual(1000);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      expect(usersService.findById).toHaveBeenCalledWith(user.id);
      expect(mapToResponse).not.toHaveBeenCalled();
    });

    it('returns access token and mapped user when findById returns a PlainUser', async () => {
      const user: PublicUser = { id: 'u1', email: 'u@x.y', role: 'user' };

      const plainUser = {
        _id: { toString: () => 'u1' },
        email: 'u@x.y',
        role: 'user',
        active: true,
        name: 'User Name',
        bio: 'bio',
        location: 'loc',
        photo: 'photo.jpg',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-02-01'),
        password: '****',
      };

      const mapped = {
        id: 'u1',
        email: 'u@x.y',
        role: 'user',
        active: true,
        name: 'User Name',
        bio: 'bio',
        location: 'loc',
        photo: 'photo.jpg',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-02-01'),
      };

      (jwtService.sign as jest.Mock).mockReturnValue('signed.token.here');
      (usersService.findById as jest.Mock).mockResolvedValue(plainUser);
      (mapToResponse as jest.Mock).mockReturnValue(mapped);

      const token = await service.login(user);

      expect(token).toEqual({
        access_token: 'signed.token.here',
        user: mapped,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      expect(usersService.findById).toHaveBeenCalledWith(user.id);
      expect(mapToResponse).toHaveBeenCalledWith(plainUser);
    });

    it('throws InternalServerErrorException when jwt.sign throws', async () => {
      const user: PublicUser = { id: 'abc', email: 'a@b.c', role: 'admin' };
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('sign failed');
      });

      await expect(service.login(user)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
