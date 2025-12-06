import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: '64a1f...' })
  id: string;

  @ApiProperty({ example: 'avatar.png' })
  filename: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../avatar.png' })
  url: string;

  @ApiProperty({ example: 'uploads/avatar_abc123', required: false })
  public_id?: string;

  @ApiProperty({ example: 'png', required: false })
  mimeType?: string;

  @ApiProperty({ example: 12345, required: false })
  size?: number;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  createdAt: Date;
}
