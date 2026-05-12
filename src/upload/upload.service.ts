import { Injectable, HttpException, HttpStatus  } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
  private supabase;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_KEY')!
    );
  }

  async uploadFile(file: Express.Multer.File, folder: string) {
    const safeName = file.originalname
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.\-_]/g, "_");

    const fileName = `${folder}/${Date.now()}-${safeName}`;

    const { error } = await this.supabase.storage
        .from("Rental")
        .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        });

    if (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const { data } = this.supabase.storage
        .from("Rental")
        .getPublicUrl(fileName);

    return data.publicUrl;
    }
}