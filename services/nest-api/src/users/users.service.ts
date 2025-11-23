import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

export interface PlainUser extends Omit<User, 'password'> {
  password: string;
  _id: { toString(): string };
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
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: {
    email: string;
    password: string;
    role?: string;
  }): Promise<UserDocument> {
    const exists = await this.userModel
      .findOne({ email: dto.email })
      .lean()
      .exec();
    if (exists) throw new ConflictException('User already exists');

    const hashed = await bcrypt.hash(String(dto.password), 10);

    const created = new this.userModel({
      email: dto.email,
      password: hashed,
      role: dto.role ?? 'user',
    });

    return created.save();
  }

  async findByEmail(email: string): Promise<PlainUser | null> {
    return this.userModel
      .findOne({ email })
      .lean()
      .exec() as Promise<PlainUser | null>;
  }

  async findById(id: string): Promise<PlainUser | null> {
    return this.userModel
      .findById(id)
      .lean()
      .exec() as Promise<PlainUser | null>;
  }

  async ensureAdmin(email: string, password: string): Promise<UserDocument> {
    const u = await this.userModel.findOne({ email }).exec();
    if (u) return u;

    const hashed = await bcrypt.hash(String(password), 10);
    const admin = new this.userModel({
      email,
      password: hashed,
      role: 'admin',
    });

    return admin.save();
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<PublicUser | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return null;

    const stored = String(user.password);
    const ok = await bcrypt.compare(password, stored);
    if (!ok) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  async list(page = 1, limit = 20): Promise<ListResult> {
    const skip = (page - 1) * limit;
    const docs = (await this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()) as PlainUser[];
    const total = await this.userModel.countDocuments();
    return { data: docs, meta: { total, page, limit } };
  }

  async update(id: string, updateDto: Partial<User>): Promise<PlainUser> {
    const payload: Partial<User> = {};

    if (typeof updateDto.email === 'string') {
      payload.email = updateDto.email;
    }

    if (typeof updateDto.role === 'string') {
      payload.role = updateDto.role;
    }

    if (typeof updateDto.active === 'boolean') {
      payload.active = updateDto.active;
    }

    if (updateDto.password) {
      payload.password = await bcrypt.hash(String(updateDto.password), 10);
    }

    const updated = (await this.userModel
      .findByIdAndUpdate(id, payload as UpdateQuery<User>, { new: true })
      .lean()
      .exec()) as PlainUser | null;

    if (!updated) throw new NotFoundException();
    return updated;
  }

  async remove(id: string): Promise<PlainUser> {
    const r = (await this.userModel
      .findByIdAndDelete(id)
      .lean()
      .exec()) as PlainUser | null;
    if (!r) throw new NotFoundException();
    return r;
  }
}
