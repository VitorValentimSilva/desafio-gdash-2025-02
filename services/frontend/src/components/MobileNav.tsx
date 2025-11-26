import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavProps {
  title: string;
  description: string;
  navItems: Array<{
    title: string;
    path: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
}

export default function MobileNav({
  title,
  description,
  navItems,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className={cn("md:hidden")}>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 hover-lift"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col justify-center items-center w-6 h-6">
            <span
              className={cn(
                "block w-6 h-0.5 bg-foreground rounded-full transition-all duration-300 ease-in-out",
                open ? "rotate-45 translate-y-1.5" : "translate-y-0"
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 bg-foreground rounded-full my-1 transition-all duration-300 ease-in-out",
                open ? "opacity-0" : "opacity-100"
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 bg-foreground rounded-full transition-all duration-300 ease-in-out",
                open ? "-rotate-45 -translate-y-1.5" : "translate-y-0"
              )}
            />
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[280px] sm:w-[320px] animate-slide-in-right"
      >
        <SheetHeader className="mb-8">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <CloudRain className="w-6 h-6 text-primary" />
            <span className="text-gradient">{title}</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col space-y-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-muted/50",
                  active
                    ? "bg-gradient-primary hover:opacity-90"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground text-center">{title}</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {description}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
