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

  @ApiProperty({ type: String, example: new Date().toISOString() })
  createdAt: Date;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  updatedAt: Date;
}
