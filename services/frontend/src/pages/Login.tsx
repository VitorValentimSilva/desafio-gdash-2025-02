import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CloudRain } from "lucide-react";
import { login } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      nav("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === "string") {
        setError(e);
      } else {
        setError("Falha no Login! Tente novamente.");
      }
    }
  };

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

        <form className="space-y-4" onSubmit={handle}>
          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>

              <Input
                id="name"
                placeholder="João Silva"
                className="h-11"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isSignup && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />

                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Lembrar de mim
                </label>
              </div>

              <a href="#" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>
          )}

          <Button
            className="w-full h-11 gradient-primary border-0 text-white hover-lift"
            type="submit"
          >
            {isSignup ? "Criar Conta" : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isSignup ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
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
