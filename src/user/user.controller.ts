import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException, 
  Headers, 
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../Auth/guard/role';
import { RolesGuard } from 'src/Auth/guard/role.guard';
import { userRole } from './enum/user.role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

 
  // Get all users
  @UseGuards(AuthGuard())
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Get a specific user by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Update a user's details
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // Delete a user
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Upload or update profile picture for an authenticated user
  @UseGuards(AuthGuard()) // Ensure this guard is applied to protect the endpoint
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Ensure this matches the form-data key
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Headers() headers: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file received. Please upload a valid file.');
    }

    try {
      return await this.userService.updateProfilePicture(file, headers);
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  

  
  @Patch(':id/block')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(userRole.ADMIN) // Only admin can block users
  async blockUser(@Param('id') id: string) {
    return this.userService.blockUser(id);
  }

  @Patch(':id/unblock')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(userRole.ADMIN) // Only admin can unblock users
  async unblockUser(@Param('id') id: string) {
    return this.userService.unblockUser(id);
  }
}