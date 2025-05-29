import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

import { seedAdmin } from './seed-admin'; // Import the seedAdmin function
config();  

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.RUN_SEED === 'true') {
    await seedAdmin(); // Call the imported seedAdmin function
  }
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
