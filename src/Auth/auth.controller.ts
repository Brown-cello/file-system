import { Controller, Post, Body, Res, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from 'src/user/dto/login.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign up a new user
  @Post('signup')
  @HttpCode(201)
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.create(createUserDto);
  }

  // Sign in a user
  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() loginDto: LoginDto, @Res() res: Response) {
    return await this.authService.signIn(loginDto, res);
  }

  // Logout a user
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res() res: Response) {
    return await this.authService.logout(req, res);
  }
}