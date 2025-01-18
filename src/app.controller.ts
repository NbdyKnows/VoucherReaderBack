import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { Express } from 'express';

@Controller('vouchers')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVoucher(@UploadedFile() file: Express.Multer.File) {
    console.log('File received in controller:', file); // Verificar el contenido del archivo
    return this.appService.uploadVoucher(file);
  }
}