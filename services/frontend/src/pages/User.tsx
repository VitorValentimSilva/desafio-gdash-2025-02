import { Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import type { UserResponse } from "@/types/user";
import { useUsersApi } from "@/hooks/useUsersApi";
import { useTranslation } from "react-i18next";
import { getUserId } from "@/lib/userStorage";
import { useAuthApi } from "@/hooks/useAuthApi";
import { useNavigate } from "react-router-dom";
import UserEditModal from "@/components/profile/UserEditModal";

export default function User() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { list, remove } = useUsersApi();
  const { logout } = useAuthApi();
  const navigate = useNavigate();
  const { t } = useTranslation("user");

  useEffect(() => {
    list(1, 100)
      .then((res) => setUsers(res.data))
      .catch(() => console.error("Erro ao carregar usuários"));
  }, [list]);

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  });

  const handleUserUpdated = (updated: UserResponse) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  async function handleDelete(id: string) {
    const ok = window.confirm(t("formUpdate.confirmDelete"));
    if (!ok) return;

    try {
      setDeletingId(id);
      await remove(id);

      setUsers((prev) => prev.filter((u) => u.id !== id));

      const currentUserId = getUserId?.() ?? null;
      if (currentUserId && currentUserId === id) {
        logout();
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      alert(t("formUpdate.errors.errorDeleteAccount"));
    } finally {
      setDeletingId(null);
    }
  }

  function getInitials(name?: string) {
    if (!name) return "?";

    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
  }

  return (
    <>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">{t("pageUsers.title")}</h1>
        <p className="text-muted-foreground">{t("pageUsers.description")}</p>
      </div>

      <Card className="p-6 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("pageUsers.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("pageUsers.table.headerName")}</TableHead>
                <TableHead>{t("pageUsers.table.headerEmail")}</TableHead>
                <TableHead>{t("pageUsers.table.headerRole")}</TableHead>
                <TableHead>{t("pageUsers.table.status")}</TableHead>
                <TableHead className="text-right">
                  {t("pageUsers.table.headerActions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {user.photo ? (
                          <img
                            src={user.photo}
                            alt={user.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <AvatarFallback className="gradient-primary text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.active ? "default" : "secondary"}
                      className={
                        user.active
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : ""
                      }
                    >
                      {user.active
                        ? t("pageUsers.table.active")
                        : t("pageUsers.table.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <UserEditModal
                        userId={user.id}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            aria-label={`Editar ${user.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                        onUpdated={handleUserUpdated}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        aria-disabled={deletingId === user.id}
                        title={t("pageUsers.table.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("pageUsers.table.noUsersFound")}
            </p>
          </div>
        )}
      </Card>
    </>
  );
}
