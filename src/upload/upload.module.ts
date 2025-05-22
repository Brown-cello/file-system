import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // ✅ Import ConfigModule
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadSchema } from './schemas/file.schema';
import { CloudinaryModule } from 'src/cloudinary/coudinary.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule, // ✅ Add this to make ConfigService available
    MongooseModule.forFeature([{ name: 'Upload', schema: UploadSchema }]), // Register schema

    CloudinaryModule,UserModule
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
