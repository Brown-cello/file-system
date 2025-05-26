import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


@Schema()
export class Upload extends Document {
  @Prop({rewired: true})
  filename: string

  @Prop({required: true}) 
  url: string;

  @Prop({required: true})
  format: string;

  @Prop({required: true})
  size: number;

  @Prop({ type: Date, default: Date.now })
  uploadedAt: Date;
}

export const uploadSchema = SchemaFactory.createForClass(Upload);