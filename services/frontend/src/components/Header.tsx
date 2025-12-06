import { Link } from "react-router-dom";
import { CloudRain } from "lucide-react";
import { getToken } from "@/lib/tokenStorage";
import { ModeToggle } from "@/components/ui/mode-toggle";
import MobileNav from "@/components/MobileNav";
import ProfileModal from "@/components/profile/ProfileModal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  title: string;
  navItems: Array<{
    title: string;
    path: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
}

export default function Header({ title, navItems }: HeaderProps) {
  const { t } = useTranslation("user");

  const token = getToken();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to={navItems[0]?.path} className="flex gap-3 items-center">
            <MobileNav
              title={title}
              description="Mantenha-se informado, mantenha-se preparado."
              navItems={navItems}
            />
            <CloudRain className="w-6 h-6 text-primary" />
            <span className="hidden md:block text-xl font-bold text-gradient">
              {title}
            </span>
          </Link>

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

            <LanguageSwitcher />

            {token && (
              <ProfileModal
                title={t("userProfileTitle")}
                description={t("userProfileDescription")}
                tabsTriggers={[
                  { title: t("menu.profile"), value: "profile" },
                  { title: t("menu.settings"), value: "settings" },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
