import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repositories/users.repository';
import { I18nService } from 'nestjs-i18n';

export interface PlainUser extends Omit<User, 'password'> {
  password: string;
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  role: string;
}

export interface ListResult {
  data: PlainUser[];
  meta: { total: number; page: number; limit: number };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private usersRepo: UsersRepository,
    private readonly i18n: I18nService,
  ) {}

  private maskEmail(email: string): string {
    try {
      const [local, domain] = email.split('@');
      if (!domain) return '***';
      const first = local?.[0] ?? '*';
      return `${first}***@${domain}`;
    } catch {
      return '***';
    }
  }

  async create(dto: {
    email: string;
    password: string;
    role?: string;
    name?: string;
    bio?: string;
    location?: string;
    photo?: string;
  }): Promise<PlainUser> {
    this.logger.log(
      this.i18n.t('user.CreatingUser', {
        args: { email: this.maskEmail(dto.email) },
      }),
    );
    try {
      const exists = await this.usersRepo.findOne({ email: dto.email });
      if (exists) {
        this.logger.warn(
          this.i18n.t('user.EmailAlreadyInUse', {
            args: { email: this.maskEmail(dto.email) },
          }),
        );
        throw new ConflictException(this.i18n.t('user.EmailAlreadyInUse'));
      }

      const hashed = await bcrypt.hash(String(dto.password), 10);

      const created = await this.usersRepo.create({
        email: dto.email,
        password: hashed,
        role: dto.role ?? 'user',
        name: dto.name,
        bio: dto.bio,
        location: dto.location,
        photo: dto.photo,
      });

      const id =
        (
          created as unknown as { _id?: { toString(): string } }
        )._id?.toString?.() ?? '<unknown>';
      this.logger.log(
        this.i18n.t('user.UserCreated', {
          args: { email: this.maskEmail(dto.email), id },
        }),
      );
      return created as PlainUser;
    } catch (e: any) {
      if (e instanceof ConflictException) {
        throw e;
      }

      this.logger.error(
        this.i18n.t('user.CreateFailed', {
          args: { email: this.maskEmail(dto.email) },
        }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('user.CreateFailed', {
          args: { email: this.maskEmail(dto.email) },
        }),
      );
    }
  }

  async findByEmail(email: string): Promise<PlainUser | null> {
    this.logger.debug(
      this.i18n.t('user.FindByEmail', {
        args: { email: this.maskEmail(email) },
      }),
    );
    try {
      const user = (await this.usersRepo.findOne({
        email,
      })) as PlainUser | null;
      if (!user)
        this.logger.debug(
          this.i18n.t('user.FindByEmailNotFound', {
            args: { email: this.maskEmail(email) },
          }),
        );
      else
        this.logger.debug(
          this.i18n.t('user.FindByEmailFound', {
            args: {
              email: this.maskEmail(email),
              id: user._id?.toString?.(),
            },
          }),
        );
      return user;
    } catch (e: any) {
      this.logger.error(
        this.i18n.t('user.FindByEmailFailed', {
          args: { email: this.maskEmail(email) },
        }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('user.FindByEmailFailed', {
          args: { email: this.maskEmail(email) },
        }),
      );
    }
  }

  async findById(id: string): Promise<PlainUser | null> {
    this.logger.debug(this.i18n.t('user.FindById', { args: { id } }));
    try {
      const user = (await this.usersRepo.findById(id)) as PlainUser | null;
      if (!user)
        this.logger.debug(
          this.i18n.t('user.FindByIdNotFound', { args: { id } }),
        );
      else
        this.logger.debug(
          this.i18n.t('user.FindByIdFound', {
            args: {
              email: this.maskEmail(user.email),
              id: user._id?.toString?.(),
            },
          }),
        );
      return user;
    } catch (e: any) {
      this.logger.error(
        this.i18n.t('user.FindByIdFailed', { args: { id } }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('user.FindByIdFailed', { args: { id } }),
      );
    }
  }

  async ensureAdmin(email: string, password: string): Promise<PlainUser> {
    this.logger.log(
      this.i18n.t('user.EnsureAdmin', {
        args: { email: this.maskEmail(email) },
      }),
    );
    try {
      const u = await this.usersRepo.findOne({ email });
      if (u) {
        this.logger.log(
          this.i18n.t('user.EnsureAdminExists', {
            args: { email: this.maskEmail(email) },
          }),
        );
        return u as PlainUser;
      }

      const hashed = await bcrypt.hash(String(password), 10);
      const created = await this.usersRepo.create({
        email,
        password: hashed,
        role: 'admin',
      });
      this.logger.log(
        this.i18n.t('user.EnsureAdminCreated', {
          args: {
            email: this.maskEmail(email),
            id: (created as PlainUser)._id?.toString?.(),
          },
        }),
      );
      return created as PlainUser;
    } catch (e: any) {
      this.logger.error(
        this.i18n.t('user.EnsureAdminFailed', {
          args: { email: this.maskEmail(email) },
        }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('user.EnsureAdminFailed', {
          args: { email: this.maskEmail(email) },
        }),
      );
    }
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<PublicUser | null> {
    this.logger.debug(
      this.i18n.t('user.ValidateCredentialsAttempt', {
        args: { email: this.maskEmail(email) },
      }),
    );
    try {
      const user = await this.usersRepo.findOne({ email });
      if (!user) {
        this.logger.warn(
          `validateCredentials: no user for ${this.maskEmail(email)}`,
        );
        return null;
      }

      const plainUser = user as PlainUser;
      const stored = String(plainUser.password);
      const ok = await bcrypt.compare(password, stored);
      if (!ok) {
        this.logger.warn(
          this.i18n.t('user.ValidateCredentialsInvalidPassword', {
            args: { email: this.maskEmail(email) },
          }),
        );
        return null;
      }

      this.logger.log(
        this.i18n.t('user.ValidateCredentialsSuccess', {
          args: {
            email: this.maskEmail(email),
            id: plainUser._id.toString(),
          },
        }),
      );

      return {
        id: plainUser._id.toString(),
        email: plainUser.email,
        role: plainUser.role,
      } as PublicUser;
    } catch (e: any) {
      this.logger.error(
        this.i18n.t('user.ValidateCredentialsFailed', {
          args: { email: this.maskEmail(email) },
        }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('user.ValidateCredentialsFailed', {
          args: { email: this.maskEmail(email) },
        }),
      );
    }
  }

  async list(page = 1, limit = 20): Promise<ListResult> {
    this.logger.debug(`list: page=${page} limit=${limit}`);
    try {
      const skip = (page - 1) * limit;
      const docs = (await this.usersRepo.find(skip, limit)) as PlainUser[];
      const total = await this.usersRepo.count();
      this.logger.debug(
        this.i18n.t('user.ListSuccess', { args: { count: docs.length } }),
      );
      return { data: docs, meta: { total, page, limit } };
    } catch (e: any) {
      this.logger.error(
        this.i18n.t('user.ListFailed'),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(this.i18n.t('user.ListFailed'));
    }
  }

  async update(id: string, updateDto: Partial<User>): Promise<PlainUser> {
    this.logger.log(this.i18n.t('user.UpdatingUser', { args: { id } }));
    try {
      const payload: Partial<User> = {};

      if (typeof updateDto.email === 'string') payload.email = updateDto.email;
      if (typeof updateDto.role === 'string') payload.role = updateDto.role;
      if (typeof updateDto.active === 'boolean')
        payload.active = updateDto.active;
      if (updateDto.password)
        payload.password = await bcrypt.hash(String(updateDto.password), 10);

      if (typeof updateDto.name === 'string') payload.name = updateDto.name;
      if (typeof updateDto.bio === 'string') payload.bio = updateDto.bio;
      if (typeof updateDto.location === 'string')
        payload.location = updateDto.location;
      if (typeof updateDto.photo === 'string') payload.photo = updateDto.photo;

      const updated = (await this.usersRepo.findByIdAndUpdate(
        id,
        payload,
      )) as PlainUser | null;
      if (!updated) {
        this.logger.warn(this.i18n.t('user.UpdateNotFound', { args: { id } }));
        throw new NotFoundException(
          this.i18n.t('user.UpdateNotFound', { args: { id } }),
        );
      }
      this.logger.log(this.i18n.t('user.UpdateSuccess', { args: { id } }));
      return updated;
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      this.logger.error(
        this.i18n.t('user.UpdateFailed', { args: { id } }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('user.UpdateFailed', { args: { id } }),
      );
    }
  }

  async remove(id: string): Promise<PlainUser> {
    this.logger.log(this.i18n.t('user.RemovingUser', { args: { id } }));
    try {
      const r = (await this.usersRepo.findByIdAndDelete(
        id,
      )) as PlainUser | null;
      if (!r) {
        this.logger.warn(this.i18n.t('user.NotFound', { args: { id } }));
        throw new NotFoundException(
          this.i18n.t('user.NotFound', { args: { id } }),
        );
      }
      this.logger.log(
        this.i18n.t('user.RemovedUser', {
          args: { id, email: this.maskEmail(r.email) },
        }),
      );
      return r;
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      this.logger.error(
        this.i18n.t('user.RemoveFailed', { args: { id } }),
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException(
        this.i18n.t('user.RemoveFailed', { args: { id } }),
      );
    }
  }

  async exportUser(id: string): Promise<Record<string, any>> {
    this.logger.log(this.i18n.t('user.ExportingUser', { args: { id } }));
    const u = await this.findById(id);
    if (!u) {
      this.logger.warn(this.i18n.t('user.FindByIdNotFound', { args: { id } }));
      throw new NotFoundException(this.i18n.t('user.FindByIdNotFound'));
    }

    const userWithOptionalFields = u as PlainUser & {
      name?: string;
      bio?: string;
      location?: string;
      photo?: string;
    };

    const exportData = {
      id: u._id.toString(),
      email: u.email,
      role: u.role,
      active: u.active,
      name: userWithOptionalFields.name ?? null,
      bio: userWithOptionalFields.bio ?? null,
      location: userWithOptionalFields.location ?? null,
      photo: userWithOptionalFields.photo ?? null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };

    return exportData;
  }
}
