import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image, ImageDocument } from '../schemas/image.entity';

@Injectable()
export class UploadsRepository {
  constructor(
    @InjectModel(Image.name) private readonly model: Model<ImageDocument>,
  ) {}

  async save(payload: Partial<Image>): Promise<ImageDocument> {
    const created = new this.model(payload);
    const saved = await created.save();
    return saved as ImageDocument;
  }

  findById(id: string): Promise<ImageDocument | null> {
    return this.model.findById(id).exec();
  }

  findAll(limit = 20, page = 1): Promise<ImageDocument[]> {
    return this.model
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }
}
