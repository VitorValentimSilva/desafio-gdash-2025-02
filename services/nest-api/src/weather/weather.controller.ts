import { Body, Controller, HttpCode, Post } from '@nestjs/common';

interface WeatherPayload {
  id?: string;
}

@Controller('api/weather')
export class WeatherController {
  @Post('logs')
  @HttpCode(201)
  createLog(@Body() payload: WeatherPayload) {
    console.log('Received weather payload', payload?.id || '<no-id>');
    return { ok: true };
  }
}
