import { IsNotEmpty, IsEmail, IsStrongPassword, IsString, IsOptional } from 'class-validator';
import { userRole } from '../enum/user.role.enum';

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

  @IsOptional()
  role: userRole;

}