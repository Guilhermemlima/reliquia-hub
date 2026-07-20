"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Store as StoreIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { setStoreStatus, testProgramConnection } from "@/modules/affiliate/actions";
import { Button } from "@/components/ui/button";

const PROVIDER_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  API: "API",
  FEED: "Feed",
  LINK_BUILDER: "Link builder",
  URL_TEMPLATE: "Modelo de URL",
  CSV: "CSV",
  DISABLED: "Desativado",
};

export function StoreCard({
  store,
}: {
  store: {
    id: string;
    name: string;
    status: string;
    allowedDomains: string[];
    _count: { offers: number };
    programs: { id: string; name: string; providerType: string; status: string; lastConnectionTest: string | null }[];
  };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <StoreIcon className="size-5 text-primary" />
            <div>
              <p className="font-medium">{store.name}</p>
              <p className="text-xs text-muted-foreground">
                {store.allowedDomains.join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {store._count.offers} ofertas
            </span>
            <Switch
              checked={store.status === "ACTIVE"}
              disabled={isPending}
              onCheckedChange={(checked) =>
                startTransition(async () => {
                  const result = await setStoreStatus(store.id, checked ? "ACTIVE" : "INACTIVE");
                  if (result.error) toast.error(result.error);
                })
              }
            />
          </div>
        </div>

        {store.programs.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-3">
            {store.programs.map((program) => (
              <div key={program.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{program.name}</span>{" "}
                  <Badge variant="secondary" className="ml-1">
                    {PROVIDER_LABELS[program.providerType] ?? program.providerType}
                  </Badge>
                  {program.lastConnectionTest && (
                    <p className="text-xs text-muted-foreground">
                      Último teste:{" "}
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                        new Date(program.lastConnectionTest)
                      )}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await testProgramConnection(program.id);
                      if ("error" in result) toast.error(result.error as string);
                      else toast[result.success ? "success" : "error"](result.message);
                    })
                  }
                >
                  Testar conexão
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
