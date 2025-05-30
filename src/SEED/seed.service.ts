// import { ConflictException, Injectable } from "@nestjs/common";
// import { Command } from "nestjs-command";
// import { userRole } from "src/user/enum/user.role.enum";
// import { UserService } from "src/user/user.service";

// @Injectable()
// export class SeedService {
//     constructor(
//     private readonly usersService: UserService, ){}
//     @Command({
//         command: 'seed:all',
//         describe: 'Seed all data',
//         })
//         async seedAll() {
//         await this.seedUsers();
       
//         }
//         @Command({
//         command: 'seed:users',
//         describe: 'Seed only 1 admin user',
//         })
//         async seedUsers() {
//         const Admin = [
//         {
//         userName: 'superadminone',
//         name: 'Super Admin One',
//         email: 'superadmin1@email.com',
//         password: 'superadmin@123',
//         role: userRole.ADMIN,
//         },
    
//         ];
//         for (const user of Admin) {
//         try {
//         await this.usersService.create(user);
//         console.log(`Created super admin: ${user.email}`);
//         } catch (error) {
//         if (error instanceof ConflictException) {
//         console.log(`Super admin already exists: ${user.email}`);
//         } else {
//         console.error(`Error creating super admin ${user.email}:`,
//         error.message);
//     //{} Assuming UsersService is imported correctly
//     }}}}}