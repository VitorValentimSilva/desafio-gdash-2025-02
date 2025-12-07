import { ApiProperty } from '@nestjs/swagger';

export class WeatherResponseDto {
  @ApiProperty({ example: '64a1f...' })
  id: string;

  @ApiProperty({ example: '2025-12-05T12:00:00Z' })
  collected_at: string;

  @ApiProperty({ example: 'openweathermap' })
  source: string;

  @ApiProperty({
    description:
      'Objeto com informações da localização (lat/lon, cidade, etc.)',
    type: Object,
    example: { lat: -23.5, lon: -46.6, city: 'São Paulo' },
  })
  location: Record<string, unknown>;

  @ApiProperty({
    description: 'Estado atual do tempo (temperatura, umidade, etc.)',
    type: Object,
    example: { temperature_c: 22.5, relative_humidity_percent: 55 },
  })
  current: Record<string, unknown>;

  @ApiProperty({
    description: 'Dados brutos da fonte',
    type: Object,
    required: false,
  })
  raw?: Record<string, unknown>;
}
