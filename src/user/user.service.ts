import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
   
  ) {}


  async user(headers: any): Promise<any> {
    const authorizationHeader = headers.authorization;
    if (!authorizationHeader) {
      throw new UnauthorizedException('Invalid or missing Bearer token');
    }
  
    const token = authorizationHeader.replace('Bearer ', '');
    try {
      const decoded = this.jwtService.verify(token); // No need to manually pass secret if configured properly
      const id = decoded["id"];
  
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      return {
        id: user._id,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl || null,
        role: user.role
      
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
 async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG and PNG are allowed.');
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    return new Promise(async (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new BadRequestException('File upload failed.'));
          }

          if (!result) {
            return reject(new BadRequestException('Cloudinary did not return a result.'));
          }

          try {
            const user = await this.userModel.findById(userId);
            if (!user) {
              throw new NotFoundException('User not found');
            }

            // Update the user's profile picture URL
            user.profilePictureUrl = result.secure_url;
            await user.save();

            resolve(result.secure_url);
          } catch (dbError) {
            console.error('Database Save Error:', dbError);
            reject(new BadRequestException('Database save failed.'));
          }
        },
      );

      const fileStream = Readable.from(file.buffer);
      fileStream.pipe(uploadStream);
    });
  }

 
  // Find all users
  findAll() {
    return this.userModel.find();
  }

  // Find a user by ID
  async findOne(id: string) {
    const findUserById = await this.userModel.findById(id);
    if (!findUserById) {
      throw new HttpException('User not found', 404);
    }
    return findUserById;
  }

  // Update a user
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Find the user by ID
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Check if the password is being updated
    if (updateUserDto.password) {
      // Hash the new password
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }
  
    // Update the user with the new data
    Object.assign(user, updateUserDto);
    const updatedUser = await user.save(); // Triggers pre-save hooks if defined
  
    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }
  // Remove a user
  async remove(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} deleted successfully` };
  }

  async blockUser(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id); // Use `findById` to query by MongoDB `_id`
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Set the user's `isBlocked` status to true
    user.IsBlocked = true;
    await user.save(); // Save the updated user document
  
    return { message: `User with ID ${id} has been blocked.` };
  }
  
  async unblockUser(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id); // Use `findById` to query by MongoDB `_id`
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Set the user's `isBlocked` status to false
    user.IsBlocked = false;
    await user.save(); // Save the updated user document
  
    return { message: `User with ID ${id} has been unblocked.` };
  }
}
