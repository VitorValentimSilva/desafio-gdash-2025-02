import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const location = useLocation();
  const { t } = useTranslation("common");

  useEffect(() => {
    console.error(
      `404 Error: User attempted to access non-existent route: ${location.pathname}`
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("pageNotFound.code")}</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          {t("pageNotFound.title")}
        </p>

        <Button variant="ghost" asChild>
          <Link to="/" className="text-primary underline hover:text-primary/90">
            {t("pageNotFound.goHomeMessage")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
