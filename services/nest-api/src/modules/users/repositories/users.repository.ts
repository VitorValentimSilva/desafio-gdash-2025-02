import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(data: Partial<User>) {
    const created = new this.userModel(data);
    return created.save();
  }

  findOne(filter: Partial<User>) {
    return this.userModel.findOne(filter).lean().exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).lean().exec();
  }

  find(skip = 0, limit = 20) {
    return this.userModel.find().skip(skip).limit(limit).lean().exec();
  }

  count() {
    return this.userModel.countDocuments();
  }

  findByIdAndUpdate(
    id: string,
    update: UpdateQuery<User>,
    options = { new: true },
  ) {
    return this.userModel.findByIdAndUpdate(id, update, options).lean().exec();
  }

  findByIdAndDelete(id: string) {
    return this.userModel.findByIdAndDelete(id).lean().exec();
  }
}
