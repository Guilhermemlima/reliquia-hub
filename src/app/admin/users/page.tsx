import type { Metadata } from "next";
import { getAllUsers } from "@/modules/admin/queries";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRow } from "@/components/admin/user-row";

export const metadata: Metadata = { title: "Usuários · Admin" };

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Usuários</h1>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Vendedor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  createdAt: user.createdAt.toISOString(),
                  sellerProfile: user.sellerProfile,
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
