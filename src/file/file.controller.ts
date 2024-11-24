import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  Request,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthorizedRequest } from 'src/user/auth/interface';
import { FileService } from 'src/file/file.service';
import { CustomThrottlerGuard } from 'src/user/guards/rate-limit.guard';

@Controller('file')
@UseGuards(CustomThrottlerGuard)
export class FileController {
  constructor(private fileService: FileService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() request: AuthorizedRequest,
  ) {
    return this.fileService.uploadFile(request.user, file);
  }

  // @Get(':userId/:filename')
  // async getFile(
  //   @Param('userId') userId: string,
  //   @Param('filename') filename: string,
  //   @Res() res: Response,
  // ) {
  //   const file = await this.fileService.getFile(parseInt(userId), filename);
  //   res.send(file);
  // }

  // @Delete(':filename')
  // async deleteFile(
  //   @Param('filename') filename: string,
  //   @Request() request: AuthorizedRequest,
  // ) {
  //   await this.fileService.deleteFile(request.user.id, filename);
  //   return { message: 'File deleted successfully' };
  // }
}
