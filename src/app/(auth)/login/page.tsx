import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldSeparator } from "@/components/ui/field";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { oauthProvidersEnabled } from "@/lib/auth.config";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para comprar, vender e conversar com outros
          colecionadores.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Suspense>
          <LoginForm />
        </Suspense>
        <FieldSeparator>ou</FieldSeparator>
        <OAuthButtons
          google={oauthProvidersEnabled.google}
          discord={oauthProvidersEnabled.discord}
        />
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/register" className="text-primary underline underline-offset-4">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
