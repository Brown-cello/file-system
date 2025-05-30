import { UserModule } from "src/user/user.module";
import { SeedService } from "./seed.service";
import { CommandModule } from "nestjs-command";
import { Module } from "@nestjs/common";

@Module({
    imports: [
    CommandModule,
    UserModule,

    
    ],
    providers: [SeedService],
    exports: [SeedService],
    })
    export class SeedModule {}