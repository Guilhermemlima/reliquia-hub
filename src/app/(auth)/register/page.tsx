import Link from "next/link";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldSeparator } from "@/components/ui/field";
import { RegisterForm } from "@/components/auth/register-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { oauthProvidersEnabled } from "@/lib/auth.config";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Criar conta</CardTitle>
        <CardDescription>
          Junte-se à comunidade de colecionadores do Relíquia Hub.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <RegisterForm />
        <FieldSeparator>ou</FieldSeparator>
        <OAuthButtons
          google={oauthProvidersEnabled.google}
          discord={oauthProvidersEnabled.discord}
        />
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
