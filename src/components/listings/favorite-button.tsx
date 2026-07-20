"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/modules/favorites/actions";

export function FavoriteButton({
  listingId,
  initialFavorited,
  isLoggedIn,
  variant = "outline",
}: {
  listingId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  variant?: "outline" | "ghost";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      disabled={isPending}
      onClick={() => {
        if (!isLoggedIn) {
          router.push("/login");
          return;
        }
        setFavorited((prev) => !prev);
        startTransition(async () => {
          const result = await toggleFavorite(listingId);
          if (result.error) {
            toast.error(result.error);
            setFavorited((prev) => !prev);
            return;
          }
          setFavorited(Boolean(result.favorited));
        });
      }}
    >
      <Heart className={cn("size-4", favorited && "fill-destructive text-destructive")} />
      {favorited ? "Favoritado" : "Favoritar"}
    </Button>
  );
}
