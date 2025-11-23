import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherDocument } from './schemas/weather.schema';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import ExcelJS, { Workbook } from 'exceljs';

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) return '';

  const keys = Array.from(
    rows.reduce(
      (acc, r) => {
        Object.keys(r).forEach((k) => acc.add(k));
        return acc;
      },
      new Set<string>(Object.keys(rows[0])),
    ),
  );

  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';

    if (typeof v === 'object') {
      try {
        const j = JSON.stringify(v);
        return `"${j.replace(/"/g, '""')}"`;
      } catch {
        return '""';
      }
    }

    if (typeof v === 'string') {
      if (/[,\n"]/g.test(v)) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    }

    if (
      typeof v === 'number' ||
      typeof v === 'boolean' ||
      typeof v === 'bigint'
    ) {
      const s = '' + v;
      if (/[,\n"]/g.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }

    if (typeof v === 'symbol') {
      const s = v.toString();
      if (/[,\n"]/g.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }

    return '';
  };

  const header = keys.join(',');
  const body = rows
    .map((r) => keys.map((k) => escape(r[k])).join(','))
    .join('\n');

  return header + '\n' + body;
}

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel('WeatherLog') private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(dto: CreateWeatherDto): Promise<WeatherDocument> {
    const doc = new this.weatherModel(dto);
    return doc.save();
  }

  async list(
    page = 1,
    limit = 20,
  ): Promise<{
    data: unknown[];
    meta: { total: number; page: number; limit: number };
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.weatherModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.weatherModel.countDocuments().exec(),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async exportCsv(): Promise<string> {
    const docs = (await this.weatherModel.find().lean().exec()) as Record<
      string,
      unknown
    >[];
    return toCsv(docs);
  }

  async exportXlsxBuffer(): Promise<Buffer> {
    const rows = (await this.weatherModel.find().lean().exec()) as Record<
      string,
      unknown
    >[];
    const wb: Workbook = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('weather');

    if (rows.length === 0) {
      ws.addRow(['no data']);
    } else {
      const keys = Object.keys(rows[0]);
      ws.addRow(keys);
      for (const r of rows) {
        const row = keys.map((k) => {
          const val = r[k];
          if (typeof val === 'object') return JSON.stringify(val);
          return val;
        });
        ws.addRow(row);
      }
    }

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async computeInsights(period = 24): Promise<{
    generated_at: string;
    samples: number;
    average_temperature_c: number | null;
    text: string;
  }> {
    const rows = (await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(period)
      .lean()
      .exec()) as Record<string, unknown>[];

    const temps: number[] = [];
    for (const r of rows) {
      const current = r.current as Record<string, unknown> | undefined;
      const t = current?.temperature_c ?? current?.temperature;
      if (t !== null && typeof t === 'number') temps.push(t);
    }

    const avg = temps.length
      ? temps.reduce((a, b) => a + b, 0) / temps.length
      : null;
    const insight = {
      generated_at: new Date().toISOString(),
      samples: temps.length,
      average_temperature_c: avg,
      text:
        avg != null
          ? `A temperatura média dos últimos ${temps.length} registros é ${avg.toFixed(1)} °C`
          : 'Dados insuficientes',
    };
    return insight;
  }
}
