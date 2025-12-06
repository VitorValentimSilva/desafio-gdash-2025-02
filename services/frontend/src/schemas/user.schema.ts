import { z } from "zod";
import type { TFunction } from "i18next";

export const createUserSchema = (t: TFunction<"user">) =>
  z
    .object({
      email: z.email({ message: t("formCreate.errors.emailErrorInvalid") }),
      password: z
        .string()
        .min(6, { message: t("formCreate.errors.passwordErrorCharacters") }),
      confirmPassword: z
        .string()
        .min(1, { message: t("formCreate.errors.confirmPasswordErrorMatch") }),
      role: z.string().optional(),
      name: z.string().optional(),
      bio: z.string().optional(),
      location: z.string().optional(),
      photo: z.string().optional().or(z.literal("")).nullable(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("formCreate.errors.confirmPasswordErrorMatch"),
      path: ["confirmPassword"],
    });

export const updateUserSchema = (t: TFunction<"user">) =>
  createUserSchema(t).partial();

export const loginSchema = (t: TFunction<"auth">) =>
  z.object({
    email: z.email({ message: t("formLogin.errors.emailErrorInvalid") }),
    password: z
      .string()
      .min(6, { message: t("formLogin.errors.passwordErrorCharacters") }),
  });

export type CreateUserPayload = z.infer<ReturnType<typeof createUserSchema>>;
export type UpdateUserPayload = z.infer<ReturnType<typeof updateUserSchema>>;
export type LoginPayload = z.infer<ReturnType<typeof loginSchema>>;
