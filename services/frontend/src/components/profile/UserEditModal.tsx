import React, { useCallback, useEffect, useState } from "react";
import { Save, User as UserIcon, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import type { UpdateUserDto, UserResponse } from "@/types/user";
import { useUploadsApi } from "@/hooks/useUploadsApi";
import { resizeImage } from "@/lib/resizeImage";
import AvatarUpload from "./AvatarUpload";
import { useUsersApi } from "@/hooks/useUsersApi";

interface UserEditModalProps {
  userId: string | null;
  trigger?: React.ReactNode;
  onUpdated?: (user: UserResponse) => void;
}

export default function UserEditModal({
  userId,
  trigger,
  onUpdated,
}: UserEditModalProps) {
  const { t } = useTranslation("user");
  const { get, update } = useUsersApi();
  const { upload } = useUploadsApi();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserResponse | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      if (!userId) {
        setError(t("formUpdate.userInvalid"));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const u = await get(userId);
        if (!u) {
          setError(t("formUpdate.errors.errorUserNotFound"));
          return;
        }
        setProfileData(u);
        setAvatarFile(null);
        setUploadProgress(null);
      } catch (err) {
        console.error("Failed to load user:", err);
        setError(t("formUpdate.errors.errorLoadingProfile"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, userId, get, t]);

  const handleAvatarFile = useCallback((file: File | null) => {
    setAvatarFile(file);
  }, []);

  const handleSave = useCallback(async () => {
    if (!userId || !profileData) {
      setError(t("formUpdate.userInvalid"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let photoUrl: string | undefined = profileData.photo ?? undefined;

      if (avatarFile) {
        setUploadingAvatar(true);
        setUploadProgress(0);

        const blob = await resizeImage(avatarFile, 1024);
        const fileName = avatarFile.name ?? "avatar.jpg";
        const newFile = new File([blob], fileName, {
          type: blob.type || "image/jpeg",
        });

        const res = await upload({ file: newFile, folder: "avatars" }, (p) => {
          setUploadProgress(p);
        });

        photoUrl = res.url;
      }

      const payload: UpdateUserDto = {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        photo: photoUrl,
      } as unknown as UpdateUserDto;

      const updated = await update(userId, payload);

      setProfileData(updated);
      setAvatarFile(null);
      setUploadProgress(null);
      setOpen(false);

      if (onUpdated) onUpdated(updated);
    } catch (err: unknown) {
      console.error("Failed to update user:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as { message?: string })?.message ??
        t("formUpdate.errors.errorUpdatingProfile");
      setError(message);
      alert(message);
    } finally {
      setUploadingAvatar(false);
      setLoading(false);
    }
  }, [userId, profileData, avatarFile, upload, update, onUpdated, t]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <UserIcon className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t("formUpdate.title")}
          </DialogTitle>
          <DialogDescription>{t("formUpdate.description")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">{t("formUpdate.loading")}</div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">{error}</div>
        ) : (
          <>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-6">
                <div className="space-y-2 w-full">
                  <AvatarUpload
                    initialUrl={profileData?.photo ?? null}
                    onFile={handleAvatarFile}
                  />
                  {uploadingAvatar && (
                    <div className="text-sm text-muted-foreground">
                      {t("formUpdate.uploadingImage")}{" "}
                      {uploadProgress != null ? `${uploadProgress}%` : ""}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("formCreate.name")}</Label>
                  <Input
                    id="name"
                    value={profileData?.name ?? ""}
                    onChange={(e) =>
                      profileData &&
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder={t("formCreate.namePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("formCreate.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData?.email ?? ""}
                      onChange={(e) =>
                        profileData &&
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="pl-10"
                      placeholder={t("formCreate.emailPlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("formCreate.bio")}</Label>
                  <Textarea
                    id="bio"
                    value={profileData?.bio ?? ""}
                    onChange={(e) =>
                      profileData &&
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder={t("formCreate.bioPlaceholder")}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t("formCreate.location")}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profileData?.location ?? ""}
                        onChange={(e) =>
                          profileData &&
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        className="pl-10"
                        placeholder={t("formCreate.locationPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("buttonCancel") ?? "Cancelar"}
                </Button>
                <Button
                  onClick={() => void handleSave()}
                  className="gap-2 gradient-primary text-white"
                  disabled={loading}
                >
                  <Save className="w-4 h-4" />
                  {t("buttonSaveChanges") ?? "Salvar"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
