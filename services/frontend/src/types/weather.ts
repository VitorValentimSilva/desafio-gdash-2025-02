export interface WeatherLog {
  id?: string;
  collected_at: string;
  location: {
    city: string;
    latitude?: number;
    longitude?: number;
  };
  current: {
    time?: string;
    temperature_c?: number;
    relative_humidity_percent?: number | null;
    wind_speed_m_s?: number | null;
    weathercode?: number | string;
    pressure_msl_hpa?: number | null;
    [k: string]: unknown;
  };
  raw?: unknown;
}
