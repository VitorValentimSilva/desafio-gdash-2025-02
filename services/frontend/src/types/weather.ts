export interface WeatherLog {
  collected_at: string;
  location: {
    city: string;
  };
  current: {
    temperature_c: number;
    relative_humidity_percent: number;
    wind_speed_m_s: number;
    pressure_msl_hpa: number;
    weathercode: string | number;
    [key: string]: unknown;
  };

  [key: string]: unknown;
}
