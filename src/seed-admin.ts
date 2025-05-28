// seed-admin.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import * as dotenv from 'dotenv';
import { userRole } from './user/enum/user.role.enum';

dotenv.config();

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

  const existingAdmin = await userService.findEmail(adminEmail).catch(() => null);

  if (!existingAdmin) {
    await userService.create({
      userName: process.env.ADMIN_USERNAME || 'admin', // Add userName property
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'SecureAdmin123!',
      role: userRole.ADMIN, // Cast 'admin' to userRole
    });
    console.log('✅ Admin seeded successfully.');
  } else {
    console.log('ℹ️ Admin already exists.');
  }

  await app.close();
}

seedAdmin();
