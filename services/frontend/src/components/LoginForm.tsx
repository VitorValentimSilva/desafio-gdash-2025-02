import { useForm, type FieldPath, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginPayload } from "@/schemas/user.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthApi } from "@/hooks/useAuthApi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { login } = useAuthApi();
  const { t } = useTranslation("auth");
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginPayload> = async (data) => {
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
        t("formLogin.errors.unknownError");

      setError("root" as FieldPath<LoginPayload>, { type: "server", message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("formLogin.email")}</Label>

        <Input
          id="email"
          type="email"
          placeholder={t("formLogin.emailPlaceholder")}
          className="h-11"
          {...register("email")}
          required
        />

        <div className="text-sm text-red-600">{errors.email?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("formLogin.password")}</Label>

        <Input
          id="password"
          type="password"
          placeholder={t("formLogin.passwordPlaceholder")}
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
        {t("formLogin.buttonSubmit")}
      </Button>
    </form>
  );
}
