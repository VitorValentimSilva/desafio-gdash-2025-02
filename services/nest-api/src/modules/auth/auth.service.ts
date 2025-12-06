import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, PublicUser } from '../users/users.service';
import { TokenResponseDto } from './dto/token-response.dto';
import { I18nService } from 'nestjs-i18n';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { mapToResponse } from '../users/utils/user.mapper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async validateUser(email: string, pass: string): Promise<PublicUser | null> {
    this.logger.debug(this.i18n.t('auth.ValidatingUser', { args: { email } }));
    try {
      const user = await this.usersService.validateCredentials(email, pass);
      if (!user) {
        this.logger.warn(this.i18n.t('auth.InvalidCredentials'));
        return null;
      }
      this.logger.log(
        this.i18n.t('auth.UserValidated', { args: { email, id: user.id } }),
      );
      return user;
    } catch (e: any) {
      this.logger.error(
        this.i18n.t('auth.ValidateFailed', { args: { email } }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('auth.ValidateFailed', { args: { email } }),
      );
    }
  }

  async login(user: PublicUser): Promise<TokenResponseDto> {
    this.logger.debug(
      this.i18n.t('auth.LoginCreatingToken', { args: { userId: user.id } }),
    );
    try {
      const payload = { sub: user.id, email: user.email, role: user.role };
      const signed = this.jwtService.sign(payload);
      const full = await this.usersService.findById(user.id);

      const userResponse: UserResponseDto = full
        ? mapToResponse(full)
        : {
            id: user.id,
            email: user.email,
            role: user.role,
            active: true,
            name: undefined,
            bio: undefined,
            location: undefined,
            photo: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

      this.logger.log(
        this.i18n.t('auth.LoginTokenCreated', { args: { userId: user.id } }),
      );
      return { access_token: signed, user: userResponse };
    } catch (e: any) {
      this.logger.error(
        this.i18n.t('auth.LoginFailed', { args: { userId: user.id } }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('auth.LoginFailed', { args: { userId: user.id } }),
      );
    }
  }
}
