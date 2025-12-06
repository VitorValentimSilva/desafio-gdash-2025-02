import { useForm, type SubmitHandler, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  type CreateUserPayload,
} from "@/schemas/user.schema";
import { useUsersApi } from "@/hooks/useUsersApi";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AvatarUpload from "./AvatarUpload";
import { useState } from "react";
import { resizeImage } from "@/lib/resizeImage";
import { useUploadsApi } from "@/hooks/useUploadsApi";

export default function SignupForm() {
  const { create } = useUsersApi();
  const { upload } = useUploadsApi();
  const { t } = useTranslation("user");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<CreateUserPayload>({
    resolver: zodResolver(createUserSchema(t)),
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

  const handleAvatarFile = async (file: File | null) => {
    if (!file) {
      setValue("photo", "");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const blob = await resizeImage(file, 1024);
      const newFile = new File([blob], file.name ?? "avatar.jpg", {
        type: blob.type || "image/jpeg",
      });

      const res = await upload({ file: newFile, folder: "avatars" }, (p) =>
        setUploadProgress(p)
      );

      setValue("photo", res.url);
    } catch (err: unknown) {
      const message =
        (
          err as {
            message?: string;
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t("formCreate.errors.unknownError");

      setError("root" as FieldPath<CreateUserPayload>, {
        type: "server",
        message,
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const onSubmit: SubmitHandler<CreateUserPayload> = async (data) => {
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
        t("formCreate.errors.unknownError");

      setError("root" as FieldPath<CreateUserPayload>, {
        type: "server",
        message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("formCreate.name")}</Label>

        <Input
          id="name"
          {...register("name")}
          placeholder={t("formCreate.namePlaceholder")}
          className="h-11"
          required
        />

        <div className="text-sm text-red-600">{errors.name?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("formCreate.email")}</Label>

        <Input
          id="email"
          type="email"
          placeholder={t("formCreate.emailPlaceholder")}
          className="h-11"
          {...register("email")}
          required
        />

        <div className="text-sm text-red-600">{errors.email?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="biography">{t("formCreate.bio")}</Label>

        <Input
          id="biography"
          type="text"
          placeholder={t("formCreate.bioPlaceholder")}
          className="h-11"
          {...register("bio")}
          required
        />

        <div className="text-sm text-red-600">{errors.bio?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">{t("formCreate.location")}</Label>

        <Input
          id="location"
          type="text"
          placeholder={t("formCreate.locationPlaceholder")}
          className="h-11"
          {...register("location")}
          required
        />

        <div className="text-sm text-red-600">{errors.location?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">gdfgdfgf</Label>

        <AvatarUpload onFile={handleAvatarFile} initialUrl={null} />

        {uploading && (
          <div className="text-sm text-muted-foreground mt-2">
            Enviando... {uploadProgress != null ? `${uploadProgress}%` : null}
          </div>
        )}

        <div className="text-sm text-red-600">{errors.photo?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("formCreate.password")}</Label>

        <Input
          id="password"
          type="password"
          placeholder={t("formCreate.passwordPlaceholder")}
          className="h-11"
          {...register("password")}
          required
        />

        <div className="text-sm text-red-600">{errors.password?.message}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          {t("formCreate.confirmPassword")}
        </Label>

        <Input
          id="confirmPassword"
          type="password"
          placeholder={t("formCreate.confirmPasswordPlaceholder")}
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
        {t("formCreate.buttonSubmit")}
      </Button>
    </form>
  );
}
