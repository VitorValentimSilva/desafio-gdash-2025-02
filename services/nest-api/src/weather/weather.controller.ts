import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('weather')
export class WeatherController {
  constructor(private svc: WeatherService) {}

  @Post('logs')
  async createLog(@Body() dto: CreateWeatherDto) {
    return this.svc.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.svc.list(Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.svc.exportCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('weather.csv');
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    const buf = await this.svc.exportXlsxBuffer();
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.attachment('weather.xlsx');
    res.send(buf);
  }

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  async getInsights(@Query('period') period = '24') {
    return this.svc.computeInsights(Number(period));
  }
}
