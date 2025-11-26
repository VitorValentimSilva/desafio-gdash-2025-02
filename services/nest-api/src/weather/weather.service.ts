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

  async computeInsights(period = 24) {
    const rows = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(period)
      .lean()
      .exec();

    if (!rows.length) {
      return {
        generated_at: new Date().toISOString(),
        samples: 0,
        summary: 'Sem dados suficientes.',
        alerts: [],
      };
    }

    const temps: number[] = [];
    const hums: number[] = [];
    const rains: number[] = [];

    for (const r of rows) {
      const c = r.current || {};
      if (typeof c.temperature_c === 'number') temps.push(c.temperature_c);
      if (typeof c.relative_humidity_percent === 'number')
        hums.push(c.relative_humidity_percent);
      if (typeof c.precipitation_probability_percent === 'number')
        rains.push(c.precipitation_probability_percent);
    }

    const avgTemp = temps.length
      ? temps.reduce((a, b) => a + b) / temps.length
      : null;
    const avgHum = hums.length
      ? hums.reduce((a, b) => a + b) / hums.length
      : null;

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (temps.length > 6) {
      const firstAvg = temps.slice(-6).reduce((a, b) => a + b) / 6;
      const lastAvg = temps.slice(0, 6).reduce((a, b) => a + b) / 6;
      if (lastAvg > firstAvg + 1) trend = 'rising';
      else if (lastAvg < firstAvg - 1) trend = 'falling';
    }

    const comfort =
      avgTemp && avgHum
        ? Math.max(
            0,
            100 - Math.abs(avgTemp - 22) * 2 - Math.abs(avgHum - 55) * 0.5,
          )
        : null;

    const classify = (t: number | null) => {
      if (t == null) return 'desconhecido';
      if (t < 12) return 'frio';
      if (t < 18) return 'agradável';
      if (t < 26) return 'quente';
      return 'muito quente';
    };

    const classification = classify(avgTemp);

    const alerts: string[] = [];

    const rainAvg = rains.length
      ? rains.reduce((a, b) => a + b) / rains.length
      : 0;

    if (rainAvg > 60) alerts.push('Alta chance de chuva');
    if (avgTemp && avgTemp > 30) alerts.push('Calor extremo');
    if (avgTemp && avgTemp < 10) alerts.push('Frio intenso');

    const summary = `
      Nos últimos ${rows.length} registros:
      - Temperatura média: ${avgTemp?.toFixed(1)}°C
      - Umidade média: ${avgHum?.toFixed(0)}%
      - Tendência: ${trend}
      - Classificação: ${classification}
      - Comfort score: ${comfort?.toFixed(0)}
      `.trim();

    return {
      generated_at: new Date().toISOString(),
      samples: rows.length,
      avg_temperature: avgTemp,
      avg_humidity: avgHum,
      temp_trend: trend,
      comfort_score: Math.round(comfort ?? 0),
      condition_classification: classification,
      alerts,
      summary,
    };
  }
}
