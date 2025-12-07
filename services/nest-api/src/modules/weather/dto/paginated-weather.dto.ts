import { ApiProperty } from '@nestjs/swagger';
import { WeatherResponseDto } from './weather-response.dto';

class MetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class PaginatedWeatherDto {
  @ApiProperty({ type: [WeatherResponseDto] })
  data: WeatherResponseDto[];

  @ApiProperty({ type: MetaDto })
  meta: MetaDto;
}
