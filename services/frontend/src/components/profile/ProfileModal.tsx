import { useState } from "react";
import { Mail, MapPin, Save, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Ana Silva",
    email: "ana@example.com",
    bio: "Weather enthusiast and data analyst. Love exploring climate patterns!",
    location: "São Paulo, BR",
    website: "https://anasilva.com",
    avatar: "",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    weatherAlerts: true,
    darkMode: false,
  });

  /*
        const handleSave = () => {
            toast({
            title: "Profile updated!",
            description: "Your changes have been saved successfully.",
            });
            setOpen(false);
        };
    

        const handleAvatarUpload = () => {
            toast({
            title: "Avatar upload",
            description: "Avatar upload feature (visual only)",
            });
        };
    */

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
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.avatar} />

                <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    /* handleAvatarUpload() */
                  }}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t("loadingAvatar")}
                </Button>

                <p className="text-xs text-muted-foreground">
                  {t("typeFileTitle")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("formCreate.name")}</Label>

                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
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
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
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
                  value={profileData.bio}
                  onChange={(e) =>
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
                      value={profileData.location}
                      onChange={(e) =>
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

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="weather-alerts" className="text-base">
                    {t("alertMeteorologicosTitle")}
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    {t("alertMeteorologicosDescription")}
                  </p>
                </div>

                <Switch
                  id="weather-alerts"
                  checked={settings.weatherAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, weatherAlerts: checked })
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
                  <Button variant="destructive" size="sm" className="w-full">
                    {t("buttonDeleteAccount")}
                  </Button>

                  <Button variant="outline" size="sm" className="w-full">
                    {t("buttonExportData")}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("buttonCancel")}
          </Button>

          <Button
            onClick={() => {
              /* handleSave() */
            }}
            className="gap-2 gradient-primary text-white"
          >
            <Save className="w-4 h-4" />
            {t("buttonSaveChanges")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
