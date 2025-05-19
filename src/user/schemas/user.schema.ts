import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class User extends Document {
  @Prop()
  userName: string

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  profilePictureUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);