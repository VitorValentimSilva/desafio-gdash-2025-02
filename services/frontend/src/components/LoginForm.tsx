import { useForm, type FieldPath, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginPayload } from "@/schemas/user.schema";
import type z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthApi } from "@/hooks/useAuthApi";
import { useNavigate } from "react-router-dom";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login } = useAuthApi();
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginValues> = async (data) => {
    try {
      await login(data as LoginPayload);
      nav("/");
    } catch (err: unknown) {
      const message =
        (
          err as {
            message?: string;
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Erro desconhecido";

      setError("root" as FieldPath<LoginValues>, { type: "server", message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="h-11"
          {...register("email")}
          required
        />

        <div className="text-sm text-red-600">{errors.email?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>

        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="h-11"
          {...register("password")}
          required
        />

        <div className="text-sm text-red-600">{errors.password?.message}</div>
      </div>

      {errors.root?.message && (
        <div className="text-sm text-red-600">{errors.root.message}</div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
