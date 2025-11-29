import { IsOptional, IsInt, Min, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Order } from '../schemas/poke.types';

export class ListQueryDto {
  @ApiPropertyOptional({ description: 'Page offset', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Page size', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Ordering: pokedex | az | za',
    example: 'pokedex',
    enum: ['pokedex', 'az', 'za'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pokedex', 'az', 'za'])
  order?: Order = 'pokedex';
}

export class SearchQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Search query', example: 'pika' })
  @IsOptional()
  @IsString()
  q?: string = '';
}

export class TypesQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    description: 'Comma separated types (e.g. grass,poison)',
    example: 'grass,poison',
  })
  @IsOptional()
  @IsString()
  types?: string;
}
