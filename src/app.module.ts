import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SeedModule } from './SEED/seed.module';
import { AuthModule } from './Auth/auth.module';

@Module({
   imports: [UserModule,SeedModule,
        ConfigModule.forRoot({
      isGlobal: true
    }), 
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: async (configService: ConfigService) => ({
   uri: configService.get<string>('DB_URI'),
   
      })
      }), AuthModule,]
})
export class AppModule {}
