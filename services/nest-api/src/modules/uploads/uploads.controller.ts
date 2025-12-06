import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadResponseDto } from './dto/upload-response.dto';
import { PaginatedUploadDto } from './dto/paginated-upload.dto';
import { ImageDocument } from './schemas/image.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
  size?: number;
}

@ApiTags('Uploads')
@ApiBearerAuth()
@ApiExtraModels(PaginatedUploadDto, UploadResponseDto)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  private mapToResponse(doc: ImageDocument | null) {
    if (!doc) return null;
    const id =
      doc._id?.toString?.() ?? (doc as unknown as { id?: string }).id ?? '';
    return {
      id,
      filename: doc.filename,
      url: doc.url,
      public_id: doc.public_id,
      mimeType: doc.mimeType,
      size: doc.size,
    } as UploadResponseDto;
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'avatars' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  async upload(
    @UploadedFile() file: MulterFile,
    @Body() body: UploadImageDto,
  ): Promise<UploadResponseDto> {
    if (!file || !file.buffer)
      throw new BadRequestException('Arquivo não informado');

    const folder = body.folder || 'uploads';
    const created = await this.uploadsService.uploadBuffer(
      file.buffer,
      file.originalname,
      folder,
    );

    return this.mapToResponse(created) as UploadResponseDto;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List images (paginated)' })
  @ApiResponse({ status: 200, type: PaginatedUploadDto })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedUploadDto> {
    const p = Number(page);
    const l = Number(limit);
    const docs = await this.uploadsService.findAll(l, p);

    const data = (docs || []).map(
      (d) => this.mapToResponse(d) as UploadResponseDto,
    );
    return {
      data,
      meta: {
        page: p,
        limit: l,
        total: Array.isArray(docs) ? data.length : 0,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get image by id' })
  @ApiResponse({ status: 200, type: UploadResponseDto })
  async get(@Param('id') id: string): Promise<UploadResponseDto | null> {
    const doc = await this.uploadsService.findById(id);
    return this.mapToResponse(doc);
  }
}
