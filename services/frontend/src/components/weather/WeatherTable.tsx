import { Download, Eye, Pencil, Trash2 } from "lucide-react";
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

interface WeatherRecord {
  datetime: string;
  location: string;
  condition: string;
  temp: string;
  humidity: string;
}

interface WeatherTableProps {
  data: WeatherRecord[];
}

export default function WeatherTable({ data }: WeatherTableProps) {
  return (
    <Card className="p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Registros Históricos</h3>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hover-lift">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" size="sm" className="hover-lift">
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
              <TableHead className="text-right">Ações</TableHead>
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
                    {record.condition}
                  </span>
                </TableCell>
                <TableCell>{record.temp}</TableCell>
                <TableCell>{record.humidity}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
