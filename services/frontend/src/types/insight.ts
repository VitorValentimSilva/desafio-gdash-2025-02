export interface Insight {
  generated_at?: string;
  summary?: string;
  alerts?: string[];
  samples?: number;
  average_temperature_c?: number | null;
  [key: string]: unknown;
}
