import type { Metadata } from "next";
import { Users, Store, ShoppingBag, Flag, CheckCircle2 } from "lucide-react";
import { getAdminStats } from "@/modules/admin/queries";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Visão geral · Admin" };

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Usuários", value: stats.users, icon: Users },
    { label: "Anúncios ativos", value: stats.activeListings, icon: CheckCircle2 },
    { label: "Anúncios totais", value: stats.listings, icon: Store },
    { label: "Pedidos", value: stats.orders, icon: ShoppingBag },
    { label: "Denúncias abertas", value: stats.openReports, icon: Flag },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Visão geral</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="pt-6">
                <Icon className="mb-2 size-5 text-primary" />
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
