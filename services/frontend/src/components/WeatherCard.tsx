interface WeatherCardProps {
  title: string;
  value: number | string;
  unit?: string;
}

export default function WeatherCard({ title, value, unit }: WeatherCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow flex flex-col justify-between">
      <div className="text-sm text-slate-500">{title}</div>

      <div className="text-2xl font-semibold">
        {value}
        {unit}
      </div>
    </div>
  );
}
