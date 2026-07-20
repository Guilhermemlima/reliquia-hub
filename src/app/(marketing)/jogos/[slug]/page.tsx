import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gamepad2, ArrowRight } from "lucide-react";
import { getGameBySlug } from "@/modules/games/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PART_CATEGORY_LABELS } from "@/modules/parts/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  return { title: game?.name ?? "Jogo" };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Gamepad2 className="size-8 text-primary" />
        <div>
          <h1 className="font-heading text-3xl font-semibold">{game.name}</h1>
          {game.description && (
            <p className="text-muted-foreground">{game.description}</p>
          )}
        </div>
      </div>

      {game.builds.length === 0 ? (
        <p className="text-muted-foreground">
          Ainda não há recomendação de montagem para este jogo.
        </p>
      ) : (
        <div className="space-y-6">
          {game.builds.map((build) => {
            const builderParams = new URLSearchParams();
            for (const rec of build.parts) {
              builderParams.set(rec.part.category, rec.partId);
            }
            return (
              <Card key={`${build.resolution}-${build.targetFps}`}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold">
                      {build.resolution} a {build.targetFps} FPS
                    </h2>
                    <Button
                      size="sm"
                      render={<Link href={`/montador?${builderParams.toString()}`} />}
                    >
                      Comparar preços <ArrowRight />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {build.parts.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between rounded-lg border p-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {PART_CATEGORY_LABELS[rec.part.category] ?? rec.part.category}
                        </span>
                        <Badge variant="secondary">{rec.part.name}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
