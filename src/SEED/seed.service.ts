import { Injectable, ConflictException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { userRole } from "src/user/enum/user.role.enum";
import * as argon2 from "argon2";
import { AuthService } from "src/Auth/auth.service";

@Injectable()
export class SeedService {
  constructor(private readonly Authservice:AuthService,
    private readonly UserService: UserService, // Assuming AuthService has methods for user management
  ) {}

  async seedAdmins(admins: Array<{ userName: string; email: string; password: string }>) {
    const seededAdmins: Array<{ userName: string; email: string; role: userRole }> = [];
    for (const admin of admins) {
      const existingAdmin = await this.UserService.findEmail(admin.email).catch(() => null);
  
      if (!existingAdmin) {
   
        const newAdmin = await this.Authservice.create({
          userName: admin.userName,
          email: admin.email,
          password: admin.password, // Use the hashed password
          role: userRole.ADMIN,
        });
  
        // Push only relevant details of the newly created admin
        seededAdmins.push({
          userName: admin.userName,
          email: admin.email,
          role: userRole.ADMIN,
        });
  
        console.log(`✅ Admin seeded successfully: ${admin.email}`);
      } else {
        console.log(`ℹ️ Admin already exists: ${admin.email}`);
      }
    }
    return seededAdmins;
  }}