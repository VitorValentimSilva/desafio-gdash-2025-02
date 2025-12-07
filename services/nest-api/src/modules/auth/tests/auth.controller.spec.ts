import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };
  const mockI18n = { t: jest.fn(() => 'msg') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.resetAllMocks());

  it('should return token on successful login', async () => {
    const fakeUser = { id: '1', email: 'a@b.com' };
    const fakeTokenResp = { access_token: 'tok', user: fakeUser };
    mockAuthService.validateUser.mockResolvedValue(fakeUser);
    mockAuthService.login.mockResolvedValue(fakeTokenResp);

    const result = await controller.login({
      email: 'a@b.com',
      password: 'secret',
    });
    expect(mockAuthService.validateUser).toHaveBeenCalledWith(
      'a@b.com',
      'secret',
    );
    expect(mockAuthService.login).toHaveBeenCalledWith(fakeUser);
    expect(result).toEqual(fakeTokenResp);
  });

  it('should throw UnauthorizedException on invalid credentials', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);
    await expect(
      controller.login({ email: 'x@y.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockI18n.t).toHaveBeenCalled();
  });
});
