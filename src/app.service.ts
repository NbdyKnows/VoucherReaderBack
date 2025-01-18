import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private supabase: SupabaseClient;
  private groqClient: any;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.groqClient = new Groq({
      apiKey: this.configService.get<string>('GROQCLOUD_API_KEY'),
    });
  }

  async uploadVoucher(file: Express.Multer.File) {
    console.log('File received in service:', file); // Verificar el contenido del archivo

    if (!file || !file.path) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const filePath = path.resolve(file.path);
    console.log('File path:', filePath); // Verificar la ruta del archivo

    // Codificar la imagen en base64
    const base64Image = this.encodeImage(filePath);
    console.log('Base64 image:', base64Image); // Verificar la imagen codificada

    // Crear la solicitud a Groq
    const result = await this.groqClient.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Envia un JSON de los datos del voucher: name, operationNumber, amount(el número que va despues del S/), date" },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: { type: 'json_object' },
      stop: null,
    });

    const detections = result.choices[0]?.message?.content;
    console.log('Detections:', detections); // Verificar las detecciones

    if (!detections || detections.length === 0) {
      throw new HttpException('No text detected', HttpStatus.BAD_REQUEST);
    }

    const extractedData = this.extractImportantData(detections);
    console.log('Extracted data:', extractedData); // Verificar los datos extraídos

    if (!extractedData.amount || !extractedData.date || !extractedData.transactionNumber) {
      return { success: false, message: 'Información Soportada no Encontrada (monto, fecha y número de transacción)', data: extractedData };
    }

    return { success: true, data: extractedData };
  }

  encodeImage(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  }

  extractImportantData(detections: string) {
    try {
      const data = JSON.parse(detections);
      const amount = data.amount || null;
      const date = data.date ? String(data.date) : null;
      const operationNumber = data.operationNumber ? String(data.operationNumber) : null;

      return { amount, date, operationNumber };
    } catch (error) {
      console.error('Error parsing detections:', error);
      return { amount: null, date: null, transactionNumber: null };
    }
  }
}