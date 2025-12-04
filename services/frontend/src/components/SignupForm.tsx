import { useForm, type SubmitHandler, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  type CreateUserPayload,
} from "@/schemas/user.schema";
import type z from "zod";
import { useUsersApi } from "@/hooks/useUsersApi";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type SignupValues = z.infer<typeof createUserSchema>;

export default function SignupForm() {
  const { create } = useUsersApi();
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      location: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      photo: "",
    },
  });

  const onSubmit: SubmitHandler<SignupValues> = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      void confirmPassword;

      await create(payload as CreateUserPayload);
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

      setError("root" as FieldPath<SignupValues>, { type: "server", message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>

        <Input
          id="name"
          {...register("name")}
          placeholder="Vitor Valentim"
          className="h-11"
          required
        />

        <div className="text-sm text-red-600">{errors.name?.message}</div>
      </div>

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
        <Label htmlFor="biography">Biografia</Label>

        <Input
          id="biography"
          type="text"
          placeholder="Sua biografia"
          className="h-11"
          {...register("bio")}
          required
        />

        <div className="text-sm text-red-600">{errors.bio?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>

        <Input
          id="location"
          type="text"
          placeholder="Sua localização"
          className="h-11"
          {...register("location")}
          required
        />

        <div className="text-sm text-red-600">{errors.location?.message}</div>
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirme a senha</Label>

        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="h-11"
          {...register("confirmPassword")}
          required
        />

        <div className="text-sm text-red-600">
          {errors.confirmPassword?.message}
        </div>
      </div>

      {errors.root?.message && (
        <div className="text-sm text-red-600">{errors.root.message}</div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Criar Conta
      </Button>
    </form>
  );
}
