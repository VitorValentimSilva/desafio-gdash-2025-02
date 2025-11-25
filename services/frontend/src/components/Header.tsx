import { CloudRain } from "lucide-react";
import MobileNav from "./MobileNav";
import { Link } from "react-router-dom";
import { ModeToggle } from "./ui/mode-toggle";
import ProfileModal from "./ProfileModal";
import { getToken } from "@/lib/auth";

interface HeaderProps {
  title: string;
  navItems: Array<{
    title: string;
    path: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
}

export default function Header({ title, navItems }: HeaderProps) {
  const token = getToken();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileNav
              title={title}
              description="Mantenha-se informado, mantenha-se preparado."
              navItems={navItems}
            />
            <CloudRain className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-gradient">{title}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems?.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={
                  "text-sm font-medium transition-colors " +
                  (location.pathname === item.path
                    ? ""
                    : "text-muted-foreground hover:text-primary")
                }
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />

            {token && (
              <ProfileModal
                title="Perfil de usuário"
                description="Gerencie as informações e preferências do seu perfil."
                tabsTriggers={[
                  { title: "Perfil", value: "profile" },
                  { title: "Configurações", value: "settings" },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
