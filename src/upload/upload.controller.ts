import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param, NotFoundException, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':userId')
  @UseInterceptors(FileInterceptor('file')) // Ensure this matches the form-data key
  async uploadFile(@UploadedFile() file: Express.Multer.File,@Param('userId') userId: string,) {
    if (!file) {
      throw new BadRequestException('No file received. Please upload a valid file.');
    }

    try {
      return await this.uploadService.uploadFile(file,userId);
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }}