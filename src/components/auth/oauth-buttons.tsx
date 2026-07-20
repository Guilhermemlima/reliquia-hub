"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function OAuthButtons({
  google,
  discord,
  callbackUrl,
}: {
  google: boolean;
  discord: boolean;
  callbackUrl?: string;
}) {
  const [loading, setLoading] = useState<"google" | "discord" | null>(null);

  if (!google && !discord) return null;

  return (
    <div className="grid gap-2">
      {google && (
        <Button
          type="button"
          variant="outline"
          disabled={loading !== null}
          onClick={() => {
            setLoading("google");
            signIn("google", { callbackUrl: callbackUrl ?? "/" });
          }}
        >
          {loading === "google" && <Loader2 className="animate-spin" />}
          Continuar com Google
        </Button>
      )}
      {discord && (
        <Button
          type="button"
          variant="outline"
          disabled={loading !== null}
          onClick={() => {
            setLoading("discord");
            signIn("discord", { callbackUrl: callbackUrl ?? "/" });
          }}
        >
          {loading === "discord" && <Loader2 className="animate-spin" />}
          Continuar com Discord
        </Button>
      )}
    </div>
  );
}
