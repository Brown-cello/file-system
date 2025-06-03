import { Controller, Post, Body } from "@nestjs/common";
import { SeedService } from "./seed.service";

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

 
  @Post('seed-admins')
  async seedAdmins() {
    return await this.seedService.seedDefaultAdmins();

  }
}