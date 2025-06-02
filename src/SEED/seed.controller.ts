import { Controller, Post, Body } from "@nestjs/common";
import { SeedService } from "./seed.service";

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('admins')
  async seedAdmins(@Body() admins: Array<{ userName: string; email: string; password: string }>) {
    const seededAdmins = await this.seedService.seedAdmins(admins);
    return {
      message: "Admins seeded successfully",
      seededAdmins,
    };
  }
}