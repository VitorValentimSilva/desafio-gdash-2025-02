import { ApiProperty } from '@nestjs/swagger';
import { UploadResponseDto } from './upload-response.dto';

class MetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 123 })
  total: number;
}

export class PaginatedUploadDto {
  @ApiProperty({ type: [UploadResponseDto] })
  data: UploadResponseDto[];

  @ApiProperty({ type: MetaDto })
  meta: MetaDto;
}
