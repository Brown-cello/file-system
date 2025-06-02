import { UserModule } from "src/user/user.module";
import { SeedService } from "./seed.service";
import { CommandModule } from "nestjs-command";
import { Module } from "@nestjs/common";
import { SeedController } from "./seed.controller";
import { AuthModule } from "src/Auth/auth.module";

@Module({
  imports: [
    CommandModule,
    UserModule,AuthModule
  ],
  providers: [SeedService],
  controllers: [SeedController], // Add the controller
  exports: [SeedService],
})
export class SeedModule {}