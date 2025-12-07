import { Injectable } from '@nestjs/common';
import { WeatherRepository } from './repositories/weather.repository';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { toCsv } from './utils/csv';
import { rowsToXlsxBuffer } from './utils/excel';
import { computeInsightsFromRows } from './utils/insights';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class WeatherService {
  constructor(
    private repo: WeatherRepository,
    private readonly i18n: I18nService,
  ) {}

  create(dto: CreateWeatherDto) {
    return this.repo.create(dto);
  }

  async list(page = 1, limit = 20) {
    const { data, total } = await this.repo.list(page, limit);
    return { data, meta: { total, page, limit } };
  }

  async exportCsv(): Promise<string> {
    const docs = (await this.repo.findAllLean()) as Record<string, unknown>[];
    return toCsv(docs);
  }

  async exportXlsxBuffer(): Promise<Buffer> {
    const rows = (await this.repo.findAllLean()) as Record<string, unknown>[];
    return rowsToXlsxBuffer(rows);
  }

  async computeInsights(period = 24) {
    const rows = await this.repo.findRecent(period);
    return computeInsightsFromRows(rows, this.i18n, period);
  }

  async last24() {
    const rows = await this.repo.findLast24();
    return rows.reverse();
  }
}
