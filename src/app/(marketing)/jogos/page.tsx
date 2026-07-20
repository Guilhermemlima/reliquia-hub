import Link from "next/link";
import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { listGames } from "@/modules/games/queries";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Jogos",
  description: "Descubra a montagem ideal de PC para rodar seus jogos favoritos.",
};

export default async function GamesPage() {
  const games = await listGames();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold">Monte um PC para jogar</h1>
        <p className="text-muted-foreground">
          Veja a configuração recomendada para cada jogo e compare preços no
          montador.
        </p>
      </div>

      {games.length === 0 ? (
        <p className="text-muted-foreground">Nenhum jogo cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {games.map((game) => (
            <Link key={game.id} href={`/jogos/${game.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                  <Gamepad2 className="size-8 text-primary" />
                  <span className="font-medium">{game.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
