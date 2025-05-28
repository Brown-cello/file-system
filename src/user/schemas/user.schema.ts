import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { userRole } from '../enum/user.role.enum';

@Schema()
export class User extends Document {
  @Prop()
  userName: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  profilePictureUrl: string;

  @Prop({ enum: userRole, default: userRole.USER })
role: userRole;

@Prop({ default: false })
  IsBlocked:boolean

}

export const UserSchema = SchemaFactory.createForClass(User);