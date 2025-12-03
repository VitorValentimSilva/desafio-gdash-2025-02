import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  name?: string;

  @Prop()
  bio?: string;

  @Prop()
  location?: string;

  @Prop()
  photo?: string;
}

export const UserSchema: MongooseSchema<User> =
  SchemaFactory.createForClass(User);
