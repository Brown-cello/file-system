import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UploadDocument } from 'src/upload/schemas/file.schema';


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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Upload' }] }) // Array of references to Upload documents
  uploads: Types.Array<UploadDocument>;
}

export const UserSchema = SchemaFactory.createForClass(User);