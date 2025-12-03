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
import { UserDocument } from './schemas/user.schema';
import { User } from './schemas/user.schema';
import type { Response, Request } from 'express';
import { Res } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(PaginatedUserDto, UserResponseDto, UserListQueryDto)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  private mapToResponse(user: PlainUser | UserDocument): UserResponseDto {
    const id =
      user._id?.toString?.() ?? (user as unknown as { id?: string }).id ?? '';
    return {
      id,
      email: (user as unknown as { email: string }).email,
      role: (user as unknown as { role: string }).role,
      active: (user as unknown as { active?: boolean }).active ?? true,
      name: (user as unknown as { name?: string }).name,
      bio: (user as unknown as { bio?: string }).bio,
      location: (user as unknown as { location?: string }).location,
      photo: (user as unknown as { photo?: string }).photo,
      createdAt:
        (user as unknown as { createdAt?: Date }).createdAt ?? new Date(),
      updatedAt:
        (user as unknown as { updatedAt?: Date }).updatedAt ?? new Date(),
    };
  }

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

    const data = result.data.map((u) => this.mapToResponse(u));
    return { data, meta: result.meta };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async get(@Param('id') id: string): Promise<UserResponseDto | null> {
    const u: PlainUser | null = await this.usersService.findById(id);
    if (!u) return null;
    return this.mapToResponse(u);
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
    return this.mapToResponse(u);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async remove(@Param('id') id: string): Promise<UserResponseDto> {
    const u: PlainUser = await this.usersService.remove(id);
    return this.mapToResponse(u);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const created: PlainUser = await this.usersService.create(dto);
    return this.mapToResponse(created);
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
    if (requester.role !== 'admin' && requester.id !== id) {
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
