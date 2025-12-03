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

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(PaginatedUserDto, UserResponseDto, UserListQueryDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private mapToResponse(user: PlainUser | UserDocument): UserResponseDto {
    const id =
      user._id?.toString?.() ?? (user as unknown as { id?: string }).id ?? '';
    return {
      id,
      email: (user as unknown as { email: string }).email,
      role: (user as unknown as { role: string }).role,
      active: (user as unknown as { active?: boolean }).active ?? true,
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
}
