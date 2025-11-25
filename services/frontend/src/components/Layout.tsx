import { Compass, Home } from "lucide-react";
import Header from "./Header";
import { getToken } from "@/lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const token = getToken();

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="WeatherPro"
        navItems={[
          ...(token ? [{ title: "Dashboard", path: "/", icon: Home }] : []),
          { title: "Pokédex", path: "/pokedex", icon: Compass },
        ]}
      />

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
