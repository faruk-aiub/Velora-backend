import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import sharp from 'sharp';
import * as fs from 'fs/promises';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload and compress an image file (Max 5MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${file.fieldname}-${uniqueSuffix}.webp`;
      const filePath = join(uploadsDir, filename);

      // Compress and convert to webp using sharp
      const info = await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Limit max width
        .webp({ quality: 80 }) // 80% quality webp
        .toFile(filePath);

      const fileUrl = `/uploads/${filename}`;
      return {
        message: 'File uploaded and optimized successfully',
        data: {
          url: fileUrl,
          filename: filename,
          mimetype: 'image/webp',
          size: info.size
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to process image');
    }
  }
}
