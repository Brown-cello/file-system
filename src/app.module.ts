import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
   imports: [UserModule,
        ConfigModule.forRoot({
      isGlobal: true
    }), 
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: async (configService: ConfigService) => ({
   uri: configService.get<string>('DB_URI'),
   
      })
      }),]
})
export class AppModule {}
