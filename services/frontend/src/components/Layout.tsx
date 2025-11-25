import { Compass, Home, Users } from "lucide-react";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header
        title="WeatherPro"
        navItems={[
          { title: "Dashboard", path: "/", icon: Home },
          { title: "Usuários", path: "/users", icon: Users },
          { title: "Pokédex", path: "/pokedex", icon: Compass },
        ]}
      />

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
