import { Controller, Post, UploadedFile, UseInterceptors, Body, Get , Query} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { Express } from 'express';

@Controller('vouchers')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return {
      message: 'Hello Vouchers!',
    };
  }
  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVoucher(@UploadedFile() file: Express.Multer.File) {
    return this.appService.uploadVoucher(file);
  }

  @Post('save')
  async saveVoucherData(@Body() extractedData: { name: string, amount: number, date: string, operationNumber: string }) {
    return this.appService.saveVoucherData(extractedData);
  }

  @Get('all')
  async getVouchers(@Query('page') page: number) {
    return this.appService.getVouchers(page);
  }
}