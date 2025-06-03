import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { userRole } from "src/user/enum/user.role.enum";
import { User } from "src/user/schemas/user.schema";
import * as argon2 from "argon2";

@Injectable()
export class SeedService  {
     constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        
      ) {}
      private readonly ADMIN_USERS_TO_SEED = [
      {
        email: 'admin@gmail.com',
        password: 'SuperSecureAdminPassword123!', 
        name: 'Admin',
        role:userRole.ADMIN
      },
      {
        email: 'admin2@dmail.com',
        password: 'AnotherStrongPassword456!', 
        name: 'Secondary Administrator',
        role:userRole.ADMIN
      },
    ];
    
    async seedDefaultAdmins(): Promise<void> {
        if (!this.ADMIN_USERS_TO_SEED || this.ADMIN_USERS_TO_SEED.length === 0) {
          console.warn('No admin users defined for seeding. Skipping.');
          return;
        }
    
        for (const adminData of this.ADMIN_USERS_TO_SEED) {
          try {
            const existingAdmin = await this.userModel.findOne({ email: adminData.email }).exec();
            if (existingAdmin) {
              console.warn(`Admin "${adminData.email}" already exists. Skipping.`);
              continue;
            }
    
            const hashedPassword = await argon2.hash(adminData.password);
    
            const newAdmin = new this.userModel({
              name: adminData.name,
              email: adminData.email,
              password: hashedPassword,
           role: adminData.role || userRole.ADMIN, // Default to ADMIN if not specified
              profilePictureUrl: null,
            });
    
            await newAdmin.save();
            console.log(`Admin "${adminData.email}" seeded successfully.`);
    
          } catch (error) {
            console.error(`Error seeding admin "${adminData.email}": ${error.message}`);
          }
        }
      }
}
    