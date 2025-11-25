export interface WeatherRow {
  id: string | number;
  collected_at: string | Date;
  location?: {
    city?: string;
  };
  current?: {
    temperature_c?: number;
    relative_humidity_percent?: number;
  };
}

interface WeatherTableProps {
  rows?: WeatherRow[];
  loading?: boolean;
}

export default function WeatherTable({
  rows = [],
  loading = false,
}: WeatherTableProps) {
  if (loading) return <div>Carregando...</div>;
  if (!rows.length) return <div>Nenhum registro</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left">
            <th className="p-2">Data</th>
            <th className="p-2">Cidade</th>
            <th className="p-2">Temperatura</th>
            <th className="p-2">Umidade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: WeatherRow) => (
            <tr key={r.id}>
              <td className="p-2">
                {new Date(r.collected_at).toLocaleString()}
              </td>
              <td className="p-2">{r.location?.city}</td>
              <td className="p-2">{r.current?.temperature_c ?? "-"}</td>
              <td className="p-2">
                {r.current?.relative_humidity_percent ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
