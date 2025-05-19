import { ConflictException, HttpException, Injectable, NotFoundException, Res, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Injectable()
export class UserService {
    constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) { }

  async create(payload: CreateUserDto) {

        try {
      const existingUser = await this.userModel.findOne({ email: payload.email });
      if (existingUser) {
        throw new ConflictException('email already exists, login or input new email address');
      }
      
    payload.email = payload.email.toLowerCase()
    const { email, password, ...rest } = payload;
    const user = await this.userModel.findOne({ where: { email: email } });
    if (user) {
      throw new HttpException('user with this email already exist', 400)
    }
    const hashPassword = await argon2.hash(password);

    const userDetails = await this.userModel.create({
      email,
      password: hashPassword,

      ...rest
    })

    const Userpayload = { id: userDetails.id, email: userDetails.email };
    return {
      userId: userDetails.id,
      userEmail: userDetails.email,
      access_token: await this.jwtService.signAsync(Userpayload),
    };
  }
    catch (error) {
      throw error;
    }
    
  }

  async findEmail(email: string) {
    const mail = await this.userModel.findOne({ email })
    if (!mail) {
      throw new UnauthorizedException()
    }
    return mail;
  }

    async signIn(payload: LoginDto,
      ) {
    const { email, password } = payload;
    // const user = await this.userRepo.findOne({where:{email:email}  })
    const user = await this.userModel.findOne({ email: payload.email }).select('+password');

    if (!user) {
      throw new HttpException('No email found', 400)
    }
    const checkedPassword = await this.verifyPassword(user.password, password);
    if (!checkedPassword) {
      throw new HttpException('password incorrect', 400)
    }
    const token = await this.jwtService.signAsync({
      email: user.email,
      id: user.id
    });

    // delete user.password
    return {
      success: true,
      userToken: token

    }
  }

    async verifyPassword(hashedPassword: string, plainPassword: string,): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (err) {
      console.log(err.message)
      return false;
    }
  }


    async user(headers: any): Promise<any> {
    const authorizationHeader = headers.authorization; //It tries to extract the authorization header from the incoming request headers. This header typically contains the token used for authentication.
    if (authorizationHeader) {
      const token = authorizationHeader.replace('Bearer ', '');
      const secret = process.env.JWTSECRET;
      //checks if the authorization header exists. If not, it will skip to the else block and throw an error.
      try {
        const decoded = this.jwtService.verify(token);
        let id = decoded["id"]; // After verifying the token, the function extracts the user's id from the decoded token payload.
        let user = await this.userModel.findOne({ id });
        return { id: id, email: user?.email,  };
      } catch (error) {
        throw new UnauthorizedException('Invalid token');

      }
    } else
      throw new UnauthorizedException('Invalid or missing Bearer token');

  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  async update(id: string, createUserDto: CreateUserDto) {
    const updateuser = await this.userModel.findById(id);
    if (!updateuser) {
      throw new NotFoundException(` record with ID ${id} not found`);
    }

    const newupdateuser = await this.userModel.findByIdAndUpdate(id,updateuser);
    const updated = await this.userModel.findOne({ where: { id } })
    

    return{
      statuscode:200,
      message:'link succesfully updated',
      data:updated
    }
}


async remove(id: string) {
  const result = await this.userModel.findByIdAndDelete(id);

  if (!result) {
    throw new NotFoundException(`Library record with ID ${id} not found`);
  
  }  

  return { message: `Library record with ID ${id} deleted successfully`,


};
} 
  
}
