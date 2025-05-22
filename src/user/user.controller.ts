import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Res, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

    @Post('signin')
  signIn(@Body() LoginDto: LoginDto, ) {
    return this.userService.signIn(LoginDto,);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  
  @Get(':userId/uploads')
  async getUserWithUploads(@Param('userId') userId: string) {
    try {
      return await this.userService.getUserWithUploads(userId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

 
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() createUserDto: CreateUserDto) {
    return this.userService.update(id, createUserDto);
  }

  @Delete(':id')
  async removeUser(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
