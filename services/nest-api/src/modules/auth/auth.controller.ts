import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';

@ApiTags('Authentication')
@ApiExtraModels(TokenResponseDto)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto): Promise<TokenResponseDto> {
    const user = await this.auth.validateUser(body.email, body.password);
    if (!user)
      throw new UnauthorizedException(this.i18n.t('auth.InvalidCredentials'));

    return this.auth.login(user);
  }
}
