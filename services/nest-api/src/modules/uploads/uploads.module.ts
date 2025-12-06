import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadsRepository } from './repositories/uploads.repository';
import { Image, ImageSchema } from './schemas/image.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, UploadsRepository],
  exports: [UploadsService],
})
export class UploadsModule {}
