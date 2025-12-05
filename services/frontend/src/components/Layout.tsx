import { Compass, Home } from "lucide-react";
import Header from "@/components/Header";
import { getToken } from "@/lib/tokenStorage";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation("common");

  const token = getToken();

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="WeatherPro"
        navItems={[
          ...(token
            ? [{ title: t("menu.dashboard"), path: "/", icon: Home }]
            : []),
          { title: t("menu.pokedex"), path: "/pokedex", icon: Compass },
        ]}
      />

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
