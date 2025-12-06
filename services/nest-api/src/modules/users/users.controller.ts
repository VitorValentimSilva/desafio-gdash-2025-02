import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UsersService, PlainUser, ListResult } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedUserDto } from './dto/paginated-user.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import type { Response, Request } from 'express';
import { Res } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { mapToResponse } from './utils/user.mapper';
import { TokenResponseDto } from '../auth/dto/token-response.dto';
import { AuthService } from '../auth/auth.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(
  PaginatedUserDto,
  UserResponseDto,
  UserListQueryDto,
  TokenResponseDto,
)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List users (paginated)' })
  @ApiResponse({ status: 200, type: PaginatedUserDto })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async list(@Query() query: UserListQueryDto): Promise<PaginatedUserDto> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const result: ListResult = await this.usersService.list(page, limit);

    const data = result.data.map((u) => mapToResponse(u));
    return { data, meta: result.meta };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async get(@Param('id') id: string): Promise<UserResponseDto | null> {
    const u: PlainUser | null = await this.usersService.findById(id);
    if (!u) return null;
    return mapToResponse(u);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const u: PlainUser = await this.usersService.update(
      id,
      dto as Partial<User>,
    );
    return mapToResponse(u);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async remove(@Param('id') id: string): Promise<UserResponseDto> {
    const u: PlainUser = await this.usersService.remove(id);
    return mapToResponse(u);
  }

  @Post()
  @ApiOperation({ summary: 'Create user and return token' })
  @ApiResponse({ status: 201, type: TokenResponseDto })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() dto: CreateUserDto): Promise<TokenResponseDto> {
    const created: PlainUser = await this.usersService.create(dto);

    const publicUser = {
      id: created._id?.toString?.(),
      email: created.email,
      role: created.role,
    };

    const tokenResponse: TokenResponseDto =
      await this.authService.login(publicUser);

    return tokenResponse;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/export')
  @ApiOperation({ summary: 'Export user data (JSON)' })
  @ApiResponse({ status: 200, description: 'JSON file attachment' })
  async export(
    @Param('id') id: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const requester = (req.user as { id?: string; role?: string }) ?? {};
    if (requester.id !== id) {
      throw new ForbiddenException(
        this.i18n.t('user.ExportingUser', { args: { id } }),
      );
    }

    const exportData = await this.usersService.exportUser(id);

    const filename = `user-${id}-export.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    return exportData;
  }
}
