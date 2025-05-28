import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { Upload } from './schemas/file.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    @InjectModel(Upload.name)
    private uploadModel: Model<Upload>,
  ) {}

  // Create a new user and optionally upload a profile picture
  async create(payload: CreateUserDto, file?: Express.Multer.File) {
    try {
      // Validate required fields
      if (!payload.email || !payload.password) {
        throw new BadRequestException('Email and password are required.');
      }
  
      const existingUser = await this.userModel.findOne({ email: payload.email });
      if (existingUser) {
        throw new ConflictException('Email already exists, login or input a new email address');
      }
  
      const { email, password, ...rest } = payload;
  
      // Hash the password
      const hashPassword = await argon2.hash(password);
  
      const userDetails = await this.userModel.create({
        email,
        password: hashPassword,
        ...rest,
      });
  
      // Debugging: Log the file to ensure it is received
      console.log('Uploaded file:', file);
  
      // If a profile picture is provided, upload it
      if (file) {
        try {
          const profilePictureUrl = await this.uploadProfilePicture(file, userDetails.id);
          userDetails.profilePictureUrl = profilePictureUrl;
  
          // Save the updated user details
          await userDetails.save();
          console.log('Profile picture URL saved:', profilePictureUrl);
        } catch (error) {
          console.error('Error uploading profile picture:', error.message);
          throw new BadRequestException('Failed to upload profile picture.');
        }
      }
  
      const userPayload = { id: userDetails.id, email: userDetails.email, profilePictureUrl: userDetails.profilePictureUrl, role: userDetails.role };
      return {
        userId: userDetails.id,
        userEmail: userDetails.email,
        profilePictureUrl: userDetails.profilePictureUrl || null,
        access_token: await this.jwtService.signAsync(userPayload),
      };
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }
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
  

  // Sign in a user
  async signIn(payload: LoginDto) {
    const { email, password, } = payload;
    const user = await this.userModel.findOne({ email: payload.email }).select('+password');

    if (!user) {
      throw new HttpException('No email found', 400);
    }

    const checkedPassword = await this.verifyPassword(user.password, password);
    if (!checkedPassword) {
      throw new HttpException('Password incorrect', 400);
    }

    const token = await this.jwtService.signAsync({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    return {
      success: true,
      userToken: token,
    };
  }

  // Verify password
  async verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }

  // Upload or update a profile picture
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

  // Update profile picture for an existing user
  async updateProfilePicture(file: Express.Multer.File, headers: any): Promise<any> {
    const user = await this.user(headers);
    const profilePictureUrl = await this.uploadProfilePicture(file, user.id);

    return {
      message: 'Profile picture updated successfully',
      profilePictureUrl,
    };
  }

  async findEmail(email: string) {
    const mail = await this.userModel.findOne({ email })
    if (!mail) {
     throw new UnauthorizedException()
    }
    return mail;
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
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
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
