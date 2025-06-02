import { HttpException, Injectable, NotFoundException, Req, Res, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Request,Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/schemas/user.schema';
import { LoginDto } from 'src/user/dto/login.dto';

@Injectable()
// user.service file

export class AuthService {
  constructor(@InjectModel(User.name) 
  private userModel: Model<User>, 
  private jwtService: JwtService) { }
   async create(payload: CreateUserDto) {
   payload.email = payload.email.toLowerCase()
   const { email, password, ...rest } = payload;
   const user = await this.userModel.findOne({ where: { email: email } });
   if (user) {
    throw new HttpException('sorry user with this email already exist', 400)
   }
   const hashPassword = await argon2.hash(password);
  
   const newUser = new this.userModel({
    email,
    password: hashPassword,
    ...rest
   });
   const userDetails = await newUser.save();
   
   const Userpayload = { id: userDetails.id, email: userDetails.email };
   return {
    access_token: await this.jwtService.signAsync(Userpayload),
   };
  
   }
  
  
   async signIn(payload: LoginDto,  @Res() res: Response) {
   const { email, password } = payload;
   // const user = await this.userRepo.findOne({where:{email:email}  })
   const user = await this.userModel.findOne({ email: payload.email }).select('+password');
   if (!user) {
  throw new HttpException('No email found', 400)
  }
  const checkedPassword = await this.verifyPassword(user.password, password);
  if (!checkedPassword) {
   throw new HttpException('sorry password not exist', 400)
  }
  const token = await this.jwtService.signAsync({
  email: user.email,
   id: user.id
   });
  
   res.cookie('isAuthenticated', token, {
    httpOnly: true,
    maxAge: 1 * 60 * 60 * 1000
   });
   // delete user.password
   return res.send({
    success: true,
 userToken: token
  
   })
  }
  
  async logout(@Req() req: Request, @Res() res: Response) {
  const clearCookie = res.clearCookie('isAuthenticated');
  
  const response = res.send(` user successfully logout`)
  
  return {
   clearCookie,
   response
   }
   }

  

   async verifyPassword(hashedPassword: string, plainPassword: string,): Promise<boolean> {
   try {
   return await argon2.verify(hashedPassword, plainPassword);
   } catch (err) {
    console.log(err.message)
    return false;
   }
   }}