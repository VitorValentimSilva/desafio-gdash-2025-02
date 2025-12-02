import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { weatherCodeToText } from "@/lib/weather";

interface WeatherRecord {
  datetime: string;
  location: string;
  condition: string;
  temp: string;
  humidity: string;
}

interface WeatherTableProps {
  data: WeatherRecord[];
  onExportCsv: () => void;
  onExportXlsx: () => void;
}

export default function WeatherTable({
  data,
  onExportCsv,
  onExportXlsx,
}: WeatherTableProps) {
  return (
    <Card className="p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Registros Históricos</h3>

        <div className="flex gap-2 flex-wrap sm:flex-row flex-col">
          <Button
            variant="outline"
            size="sm"
            className="hover-lift"
            onClick={onExportCsv}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hover-lift"
            onClick={onExportXlsx}
          >
            <Download className="w-4 h-4 mr-2" />
            Export XLSX
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Umidade</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((record, index) => (
              <TableRow
                key={index}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{record.datetime}</TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {weatherCodeToText(record.condition)}
                  </span>
                </TableCell>
                <TableCell>{record.temp}</TableCell>
                <TableCell>{record.humidity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
