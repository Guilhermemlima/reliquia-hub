import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBuyerOrders, getSellerOrders } from "@/modules/orders/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/format";
import {
  BuyerOrderActions,
  SellerOrderActions,
} from "@/components/orders/order-actions";
import { ReviewDialog } from "@/components/orders/review-dialog";

export const metadata: Metadata = { title: "Compras e vendas" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago — aguardando envio",
  SHIPPED: "Enviado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  DISPUTED: "Em disputa",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [purchases, sales] = await Promise.all([
    getBuyerOrders(session.user.id),
    getSellerOrders(session.user.id),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">
        Compras e vendas
      </h1>
      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">Compras ({purchases.length})</TabsTrigger>
          <TabsTrigger value="sales">Vendas ({sales.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-4 space-y-3">
          {purchases.length === 0 ? (
            <p className="text-muted-foreground">Você ainda não fez nenhuma compra.</p>
          ) : (
            purchases.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {order.listing.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.listing.images[0].url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/listings/${order.listing.slug}`}
                      className="font-medium hover:underline"
                    >
                      {order.listing.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Vendedor: {order.seller.name} · {formatDate(order.createdAt)}
                    </p>
                    <p className="font-medium">
                      {formatPrice(order.amount.toString(), order.currency)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </Badge>
                    <BuyerOrderActions orderId={order.id} status={order.status} />
                    {order.status === "COMPLETED" && !order.review && (
                      <ReviewDialog
                        orderId={order.id}
                        sellerName={order.seller.name ?? "vendedor"}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-4 space-y-3">
          {sales.length === 0 ? (
            <p className="text-muted-foreground">Você ainda não vendeu nada.</p>
          ) : (
            sales.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {order.listing.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.listing.images[0].url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/listings/${order.listing.slug}`}
                      className="font-medium hover:underline"
                    >
                      {order.listing.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Comprador: {order.buyer.name} · {formatDate(order.createdAt)}
                    </p>
                    <p className="font-medium">
                      {formatPrice(order.amount.toString(), order.currency)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </Badge>
                    <SellerOrderActions orderId={order.id} status={order.status} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
