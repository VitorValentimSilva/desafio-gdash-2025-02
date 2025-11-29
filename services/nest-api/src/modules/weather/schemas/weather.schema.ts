import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type WeatherDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true, index: true })
  id: string;

  @Prop()
  collected_at: string;

  @Prop()
  source: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  location: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  current: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  raw: Record<string, unknown>;
}

export const WeatherSchema = SchemaFactory.createForClass(WeatherLog);
