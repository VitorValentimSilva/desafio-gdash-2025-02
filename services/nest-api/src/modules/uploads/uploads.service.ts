import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadsRepository } from './repositories/uploads.repository';
import { ImageDocument } from './schemas/image.entity';
import { uploadBufferToCloudinary } from './utils/cloudinary.provider';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly uploadsRepo: UploadsRepository) {}

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    folder = 'uploads',
  ): Promise<ImageDocument> {
    this.logger.log(`Starting upload: ${filename} to folder: ${folder}`);
    if (!buffer) throw new BadRequestException('Buffer is required');
    this.logger.log(`Uploading to folder: ${folder}, filename: ${filename}`);

    try {
      const result = await uploadBufferToCloudinary(buffer, folder);
      this.logger.debug('Cloudinary upload result: ' + JSON.stringify(result));
      const saved = await this.uploadsRepo.save({
        filename: result.original_filename || filename,
        url: result.secure_url || result.url,
        public_id: result.public_id,
        mimeType: result.format,
        size: result.bytes,
      });
      this.logger.log(`Saved upload document id=${String(saved._id)}`);
      return saved;
    } catch (err) {
      this.logger.error('uploadBuffer failed', err);
      throw new InternalServerErrorException(
        'Erro ao processar upload. Veja logs do servidor.',
      );
    }
  }

  findById(id: string) {
    return this.uploadsRepo.findById(id);
  }

  findAll(limit = 20, page = 1) {
    return this.uploadsRepo.findAll(limit, page);
  }
}
