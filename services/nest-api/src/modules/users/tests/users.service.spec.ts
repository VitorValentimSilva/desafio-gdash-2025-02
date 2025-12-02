import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../repositories/users.repository';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repo: Partial<Record<keyof UsersRepository, jest.Mock>>;
  let i18n: Partial<I18nService>;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    } as Partial<Record<keyof UsersRepository, jest.Mock>>;

    i18n = {
      t: jest.fn().mockImplementation((k: string) => k),
    } as Partial<I18nService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repo },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException when email already exists', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue({ email: 'a@b.com' });

      await expect(
        service.create({ email: 'a@b.com', password: 'secret' }),
      ).rejects.toThrow(ConflictException);

      expect(repo.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
    });

    it('should create user and hash password', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const hashed = 'hashedPwd';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed as never);

      const fakeCreated = {
        _id: { toString: () => 'id1' },
        email: 'a@b.com',
        password: hashed,
        role: 'user',
      };
      (repo.create as jest.Mock).mockResolvedValue(fakeCreated);

      const res = await service.create({
        email: 'a@b.com',
        password: 'secret',
        role: 'user',
      });
      expect(repo.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
      expect(repo.create).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: hashed,
        role: 'user',
      });
      expect(res).toEqual(fakeCreated);
    });
  });

  describe('findByEmail', () => {
    it('returns null when not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const res = await service.findByEmail('no@one.com');
      expect(res).toBeNull();
      expect(repo.findOne).toHaveBeenCalledWith({ email: 'no@one.com' });
    });

    it('returns user when found', async () => {
      const user = {
        _id: { toString: () => 'id1' },
        email: 'u@e.com',
        password: 'p',
      };
      (repo.findOne as jest.Mock).mockResolvedValue(user);
      const res = await service.findByEmail('u@e.com');
      expect(res).toEqual(user);
    });
  });

  describe('validateCredentials', () => {
    it('returns null when user not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const res = await service.validateCredentials('no@one.com', 'x');
      expect(res).toBeNull();
    });

    it('returns null when password is incorrect', async () => {
      const user = {
        _id: { toString: () => 'id1' },
        email: 'u@e.com',
        password: 'hashed',
      };
      (repo.findOne as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const res = await service.validateCredentials('u@e.com', 'wrong');
      expect(res).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
    });

    it('returns PublicUser when password correct', async () => {
      const user = {
        _id: { toString: () => 'id1' },
        email: 'u@e.com',
        password: 'hashed',
        role: 'user',
      };
      (repo.findOne as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const res = await service.validateCredentials('u@e.com', 'right');
      expect(res).toEqual({ id: 'id1', email: 'u@e.com', role: 'user' });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when update target not found', async () => {
      (repo.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('nonid', { email: 'x@y.com' }),
      ).rejects.toThrow(NotFoundException);
      expect(repo.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('returns updated user when found', async () => {
      const updated = {
        _id: { toString: () => 'id2' },
        email: 'x@y.com',
        password: 'p',
      };
      (repo.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

      const res = await service.update('id2', { email: 'x@y.com' });
      expect(res).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when remove target not found', async () => {
      (repo.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
      expect(repo.findByIdAndDelete).toHaveBeenCalledWith('nope');
    });

    it('returns deleted user when found', async () => {
      const deleted = {
        _id: { toString: () => 'id3' },
        email: 'del@e.com',
        password: 'p',
      };
      (repo.findByIdAndDelete as jest.Mock).mockResolvedValue(deleted);

      const res = await service.remove('id3');
      expect(res).toEqual(deleted);
    });
  });
});
