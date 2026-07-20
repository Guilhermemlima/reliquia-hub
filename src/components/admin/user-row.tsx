"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { setUserRole, setSellerVerified } from "@/modules/admin/actions";
import { formatDate } from "@/lib/format";

export function UserRow({
  user,
}: {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: string;
    sellerProfile: { verified: boolean; storeName: string } | null;
  };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{user.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </TableCell>
      <TableCell>{formatDate(user.createdAt)}</TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={(v) =>
            v &&
            startTransition(async () => {
              const result = await setUserRole(
                user.id,
                v as "USER" | "SELLER" | "ADMIN"
              );
              if (result.error) toast.error(result.error);
            })
          }
        >
          <SelectTrigger className="w-32" disabled={isPending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="SELLER">SELLER</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {user.sellerProfile ? (
          <div className="flex items-center gap-2">
            <Switch
              checked={user.sellerProfile.verified}
              disabled={isPending}
              onCheckedChange={(checked) =>
                startTransition(async () => {
                  const result = await setSellerVerified(user.id, checked);
                  if (result.error) toast.error(result.error);
                })
              }
            />
            <span className="text-xs text-muted-foreground">
              {user.sellerProfile.verified ? "Verificado" : "Não verificado"}
            </span>
          </div>
        ) : (
          <Badge variant="secondary">Não é vendedor</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
