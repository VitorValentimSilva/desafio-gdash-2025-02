import { z } from "zod";

export const createUserSchema = z
  .object({
    email: z.email({ message: "Email inválido" }),
    password: z
      .string()
      .min(6, { message: "Senha deve ter ao menos 6 caracteres" }),
    confirmPassword: z.string().min(1, { message: "Confirme a senha" }),
    role: z.string().optional(),
    name: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    photo: z.url({ message: "URL inválida" }).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const updateUserSchema = createUserSchema.partial();

export const loginSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter ao menos 6 caracteres" }),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
