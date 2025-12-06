import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'images',
})
export class Image extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  public_id?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;
}

export type ImageDocument = Image & Document;

export const ImageSchema = SchemaFactory.createForClass(Image);
