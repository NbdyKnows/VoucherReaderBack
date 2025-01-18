import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Express } from 'express';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('uploadVoucher', () => {
    it('should return extracted data', async () => {
      const file: Express.Multer.File = {
        buffer: Buffer.from('test'),
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1234,
        encoding: '7bit',
        fieldname: 'file',
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const result = { success: true, data: { amount: '100', date: '2023-01-01', transactionNumber: '12345' } };
      jest.spyOn(appService, 'uploadVoucher').mockImplementation(async () => result);

      expect(await appController.uploadVoucher(file)).toBe(result);
    });
  });
});