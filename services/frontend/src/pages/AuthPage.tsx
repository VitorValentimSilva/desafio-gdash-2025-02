import { CloudRain } from "lucide-react";
import { Card } from "@/components/ui/card";
import LoginForm from "@/components/profile/LoginForm";
import SignupForm from "@/components/profile/SignupForm";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface AuthPageProps {
  isSignup?: boolean;
}

export default function AuthPage({ isSignup = false }: AuthPageProps) {
  const nav = useNavigate();
  const { t } = useTranslation(["auth", "user"]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-xl p-8 relative z-10 animate-scale-in">
        <div className="text-center mb-1">
          <div className="flex items-center justify-center sm:justify-between mb-5 flex-wrap gap-4">
            <div className="flex gap-2">
              <CloudRain className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">
                WeatherPro
              </span>
            </div>

            <LanguageSwitcher />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {isSignup
              ? t("form.formTitle", { ns: "user" })
              : t("form.formTitle", { ns: "auth" })}
          </h1>

          <p className="text-muted-foreground">
            {isSignup
              ? t("form.formSubtitle", { ns: "user" })
              : t("form.formSubtitle", { ns: "auth" })}
          </p>
        </div>

        {isSignup ? <SignupForm /> : <LoginForm />}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isSignup
              ? t("form.formMessage", { ns: "auth" })
              : t("form.formMessage", { ns: "auth" })}
            <button
              onClick={() => nav(isSignup ? "/login" : "/signup")}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              {isSignup
                ? t("form.formButton", { ns: "user" })
                : t("form.formButton", { ns: "auth" })}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
