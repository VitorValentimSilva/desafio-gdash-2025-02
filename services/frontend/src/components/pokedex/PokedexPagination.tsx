import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function PokedexPagination({
  page,
  totalPages,
  onChange,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="px-3 py-2 rounded-md bg-surface/6">
        Página {page} de {totalPages}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
