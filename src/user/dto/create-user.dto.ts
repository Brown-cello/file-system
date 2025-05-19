import { IsNotEmpty, IsEmail, IsStrongPassword, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  userName: string;

  @IsStrongPassword()
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

}