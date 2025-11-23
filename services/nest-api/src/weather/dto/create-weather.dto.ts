import { IsObject, IsString, IsOptional } from 'class-validator';

export class CreateWeatherDto {
  @IsString()
  id: string;

  @IsString()
  collected_at: string;

  @IsString()
  source: string;

  @IsObject()
  location: Record<string, any>;

  @IsObject()
  current: Record<string, any>;

  @IsOptional()
  raw?: any;
}
