import { useCallback, useEffect, useState } from "react";
import { useUsersApi } from "@/hooks/useUsersApi";
import { Download, Mail, MapPin, Save, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { clearUserId, getUserId } from "@/lib/userStorage";
import type { UpdateUserDto, UserResponse } from "@/types/user";
import { useUploadsApi } from "@/hooks/useUploadsApi";
import { resizeImage } from "@/lib/resizeImage";
import AvatarUpload from "./AvatarUpload";
import { useNavigate } from "react-router-dom";
import { clearToken } from "@/lib/tokenStorage";

interface ProfileModalProps {
  title: string;
  description: string;
  tabsTriggers?: Array<{
    title: string;
    value: string;
  }>;
}

export default function ProfileModal({
  title,
  description,
  tabsTriggers,
}: ProfileModalProps) {
  const { t } = useTranslation("user");
  const { get, update, remove, exportUser } = useUsersApi();
  const { upload } = useUploadsApi();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserResponse | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [actionLoading, setActionLoading] = useState({
    exporting: false,
    deleting: false,
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    weatherAlerts: true,
    darkMode: false,
  });

  const handleLogout = useCallback(() => {
    clearToken();
    clearUserId();
    navigate("/login");
  }, [navigate]);

  const handleAvatarFile = useCallback((file: File | null) => {
    setAvatarFile(file);
  }, []);

  const handleSave = useCallback(async () => {
    const id = getUserId();
    if (!id || !profileData) {
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

      const updated = await update(id, payload);

      setProfileData(updated);

      setAvatarFile(null);
      setUploadProgress(null);

      alert(t("formUpdate.profileUpdated"));

      setOpen(false);
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
  }, [profileData, avatarFile, upload, update, t]);

  const loadLoggedUser = useCallback(async () => {
    const id = getUserId();
    if (!id) {
      setError(t("formUpdate.errors.errorUserNotLoggedIn"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await get(id);
      if (!user) {
        setError(t("formUpdate.errors.errorUserNotFound"));
        return;
      }

      setProfileData(user);
    } catch (err) {
      console.error("Failed to load user:", err);
      setError(t("formUpdate.errors.errorLoadingProfile"));
    } finally {
      setLoading(false);
    }
  }, [get, t]);

  const handleExportData = useCallback(async () => {
    const id = getUserId();
    if (!id) {
      alert(t("formUpdate.errors.errorUserNotLoggedIn"));
      return;
    }

    if (!confirm(t("formUpdate.confirmExport"))) return;

    setActionLoading((s) => ({ ...s, exporting: true }));
    setError(null);

    try {
      const res = await exportUser(id);

      if (
        res &&
        typeof res === "object" &&
        "url" in res &&
        typeof res.url === "string"
      ) {
        window.open(res.url, "_blank");
        setActionLoading((s) => ({ ...s, exporting: false }));
        return;
      }

      if (typeof res === "string") {
        window.open(res, "_blank");
        setActionLoading((s) => ({ ...s, exporting: false }));
        return;
      }

      let blob: Blob | null = null;

      if (res && typeof res === "object" && "data" in res) {
        const maybe = res.data;
        if (maybe instanceof Blob) blob = maybe;
        else if (maybe instanceof ArrayBuffer) blob = new Blob([maybe]);
      } else if ((res as unknown) instanceof Blob) {
        blob = res as Blob;
      } else if ((res as unknown) instanceof ArrayBuffer) {
        blob = new Blob([res as ArrayBuffer]);
      }

      if (!blob) {
        if (
          res &&
          typeof res === "object" &&
          "downloadUrl" in res &&
          typeof res.downloadUrl === "string"
        ) {
          window.open(res.downloadUrl, "_blank");
          setActionLoading((s) => ({ ...s, exporting: false }));
          return;
        }
        throw new Error(t("formUpdate.errors.errorFormatExport"));
      }

      let filename = `export-${id}.zip`;

      const headers = res.headers;
      if (headers && headers["content-disposition"]) {
        const match = /filename="?([^"]+)"?/.exec(
          headers["content-disposition"]
        );
        if (match?.[1]) filename = match[1];
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert(t("formUpdate.exportSuccess"));
    } catch (err) {
      console.error("Failed to export user:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as { message?: string })?.message ??
        t("formUpdate.errors.errorExport");
      setError(message);
      alert(message);
    } finally {
      setActionLoading((s) => ({ ...s, exporting: false }));
    }
  }, [exportUser, t]);

  const handleDeleteAccount = useCallback(async () => {
    const id = getUserId();
    if (!id) {
      alert(t("formUpdate.errors.errorUserNotLoggedIn"));
      return;
    }

    if (!confirm(t("formUpdate.confirmDelete"))) {
      return;
    }

    setActionLoading((s) => ({ ...s, deleting: true }));
    setError(null);

    try {
      await remove(id);
      clearToken();
      clearUserId();

      alert(t("formUpdate.deleteSuccess"));

      navigate("/signup");
    } catch (err) {
      console.error("Failed to remove user:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as { message?: string })?.message ??
        t("formUpdate.errors.errorDeleteAccount");
      setError(message);
      alert(message);
    } finally {
      setActionLoading((s) => ({ ...s, deleting: false }));
    }
  }, [remove, navigate, t]);

  useEffect(() => {
    if (open) {
      void loadLoggedUser();
      setAvatarFile(null);
      setUploadProgress(null);
    }
  }, [open, loadLoggedUser]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover-lift">
          <User className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>

          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">{t("formUpdate.loading")}</div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">{error}</div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {tabsTriggers?.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
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
                    value={profileData?.name}
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
                      value={profileData?.email}
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
                    value={profileData?.bio}
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
                        value={profileData?.location}
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
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">
                      {t("notificationEmailTitle")}
                    </Label>

                    <p className="text-sm text-muted-foreground">
                      {t("notificationEmailDescription")}
                    </p>
                  </div>

                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="p-4 border border-border rounded-lg space-y-3">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t("dangerAlertTitle")}</Label>

                    <p className="text-sm text-muted-foreground">
                      {t("dangerAlertDescription")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => void handleDeleteAccount()}
                      disabled={actionLoading.deleting}
                    >
                      <Trash2 className="w-4 h-4" />
                      {actionLoading.deleting
                        ? t("formUpdate.deleting")
                        : t("buttonDeleteAccount")}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => void handleExportData()}
                      disabled={actionLoading.exporting}
                    >
                      <Download className="w-4 h-4" />
                      {actionLoading.exporting
                        ? t("formUpdate.exporting")
                        : t("buttonExportData")}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleLogout}
                    >
                      <User className="w-4 h-4" />
                      {t("buttonLogout")}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("buttonCancel")}
          </Button>

          <Button
            onClick={() => {
              void handleSave();
            }}
            className="gap-2 gradient-primary text-white"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {t("buttonSaveChanges")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
