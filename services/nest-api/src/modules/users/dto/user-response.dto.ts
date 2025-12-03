import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '64a1f...' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'user' })
  role: string;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: 'Vitor Valentim' })
  name?: string;

  @ApiProperty({ example: 'Software developer' })
  bio?: string;

  @ApiProperty({ example: 'São Paulo, Brazil' })
  location?: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.jpg' })
  photo?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  createdAt: Date;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  updatedAt: Date;
}
