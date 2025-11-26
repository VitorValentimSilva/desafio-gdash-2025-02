export interface Insight {
  summary: string;
  alerts?: string[];
  [key: string]: unknown;
}
