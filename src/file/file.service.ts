import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/dto/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class FileService {
  private readonly uploadDir: string;

  constructor() {
    // Create uploads directory in project root
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    Logger.debug(`File upload directory initialized at: ${this.uploadDir}`);
  }

  async uploadFile(user: User, file: Express.Multer.File) {
    try {
      // Create user-specific directory
      const userDir = path.join(this.uploadDir, user.id.toString());
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Generate secure random filename
      const randomStr = randomBytes(16).toString('hex');
      const fileExt = path.extname(file.originalname);
      const timestamp = Date.now();
      const filename = `${timestamp}_${randomStr}${fileExt}`;
      const filepath = path.join(userDir, filename);

      // Validate file type and size
      const allowedMimeTypes = ['image/jpeg', 'image/png'];
      const maxSize = 20 * 1024 * 1024; // 20MB

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      }

      if (file.size > maxSize) {
        throw new Error('File size exceeds the 20MB limit.');
      }

      // Write file to disk
      await fs.promises.writeFile(filepath, file.buffer);

      Logger.debug(`File uploaded successfully: ${filepath}`);

      // Return full URL instead of path
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      return {
        filename,
        url: `${baseUrl}/uploads/${user.id}/${filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };
    } catch (error) {
      Logger.error(`File upload failed: ${error.message}`);
      throw error;
    }
  }

  async getFile(userId: number, filename: string): Promise<Buffer> {
    const filepath = path.join(this.uploadDir, userId.toString(), filename);
    try {
      return await fs.promises.readFile(filepath);
    } catch (error) {
      Logger.error(`File read failed: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(userId: number, filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, userId.toString(), filename);
    try {
      await fs.promises.unlink(filepath);
      Logger.debug(`File deleted successfully: ${filepath}`);
    } catch (error) {
      Logger.error(`File deletion failed: ${error.message}`);
      throw error;
    }
  }
}
