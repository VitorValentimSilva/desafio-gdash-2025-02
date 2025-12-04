import { CloudRain } from "lucide-react";
import { Card } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { useNavigate } from "react-router-dom";

interface AuthPageProps {
  isSignup?: boolean;
}

export default function AuthPage({ isSignup = false }: AuthPageProps) {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md p-8 relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CloudRain className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">WeatherPro</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {isSignup ? "Criar Conta" : "Bem-vindo de volta"}
          </h1>

          <p className="text-muted-foreground">
            {isSignup
              ? "Preencha os dados para criar sua conta"
              : "Entre com suas credenciais para continuar"}
          </p>
        </div>

        {isSignup ? <SignupForm /> : <LoginForm />}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isSignup ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button
              onClick={() => nav(isSignup ? "/login" : "/signup")}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              {isSignup ? "Fazer login" : "Criar conta"}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
