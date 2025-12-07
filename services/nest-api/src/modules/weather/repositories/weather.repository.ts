import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { WeatherLog, WeatherDocument } from '../schemas/weather.schema';

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  create(dto: Partial<WeatherDocument>) {
    const doc = new this.weatherModel(dto);
    return doc.save();
  }

  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.weatherModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.weatherModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  findAllLean() {
    return this.weatherModel.find().lean().exec();
  }

  findRecent(limit = 24) {
    return this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  findLast24() {
    return this.weatherModel
      .find()
      .sort({ collected_at: -1 })
      .limit(24)
      .lean()
      .exec();
  }

  count() {
    return this.weatherModel.countDocuments().exec();
  }
}
