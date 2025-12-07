import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { I18nService } from 'nestjs-i18n';

describe('AuthModule (unit smoke)', () => {
  let moduleRef: TestingModule;
  let authService: AuthService;
  let jwtStrategy: JwtStrategy;
  let authController: AuthController;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };
  const mockI18n = { t: jest.fn((k: string) => k) };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        JwtStrategy,
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
    authController = moduleRef.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should have authService, jwtStrategy and controller defined', () => {
    expect(authService).toBeDefined();
    expect(jwtStrategy).toBeDefined();
    expect(authController).toBeDefined();
  });
});
