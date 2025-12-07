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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiExtraModels,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaginatedWeatherDto } from './dto/paginated-weather.dto';
import { WeatherResponseDto } from './dto/weather-response.dto';
import type { WeatherDocument, WeatherLog } from './schemas/weather.schema';

@ApiTags('Weather')
@ApiBearerAuth()
@ApiExtraModels(PaginatedWeatherDto, WeatherResponseDto)
@Controller('weather')
export class WeatherController {
  constructor(private svc: WeatherService) {}

  private mapToResponse(
    doc: WeatherDocument | WeatherLog | null,
  ): WeatherResponseDto | null {
    if (!doc) return null;
    const id = String(doc.id ?? '');
    return {
      id,
      collected_at: doc.collected_at,
      source: doc.source,
      location: doc.location ?? {},
      current: doc.current ?? {},
      raw: doc.raw,
    } as WeatherResponseDto;
  }

  @Post('logs')
  @ApiOperation({ summary: 'Create weather log' })
  @ApiResponse({ status: 201, type: WeatherResponseDto })
  async createLog(@Body() dto: CreateWeatherDto) {
    const created = await this.svc.create(dto);
    return this.mapToResponse(created);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  @ApiOperation({ summary: 'List weather logs (paginated)' })
  @ApiResponse({ status: 200, type: PaginatedWeatherDto })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    const p = Number(page);
    const l = Number(limit);
    const res = await this.svc.list(p, l);
    const data = (res.data || []).map(
      (d) => this.mapToResponse(d) as WeatherResponseDto,
    );
    return {
      data,
      meta: {
        page: p,
        limit: l,
        total: res.meta?.total ?? data.length,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  @ApiOperation({ summary: 'Export all weather logs as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.svc.exportCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('weather.csv');
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  @ApiOperation({ summary: 'Export all weather logs as XLSX' })
  @ApiResponse({ status: 200, description: 'XLSX file' })
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
  @ApiOperation({ summary: 'Compute insights from recent logs' })
  @ApiQuery({
    name: 'period',
    required: false,
    example: 24,
    description: 'Number of recent records to consider',
  })
  @ApiResponse({ status: 200, type: Object })
  async getInsights(@Query('period') period = '24') {
    return this.svc.computeInsights(Number(period));
  }

  @UseGuards(JwtAuthGuard)
  @Get('last-24')
  @ApiOperation({ summary: 'Get last 24 collected records (chronological)' })
  @ApiResponse({ status: 200, type: [WeatherResponseDto] })
  async getLast24() {
    const rows = await this.svc.last24();
    return (rows || []).map((r) => this.mapToResponse(r));
  }
}
