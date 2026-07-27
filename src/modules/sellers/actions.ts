"use server";

import { auth } from "@/lib/auth";
import { createConnectOnboardingLink, syncConnectAccountStatus } from "@/modules/payments/connect";

async function requireUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function connectStripeAccount() {
  const user = await requireUser();
  if (!user) return { error: "Você precisa estar logado." };

  return createConnectOnboardingLink({ userId: user.id, email: user.email });
}

export async function refreshStripeAccountStatus() {
  const user = await requireUser();
  if (!user) return { error: "Você precisa estar logado." };

  const status = await syncConnectAccountStatus(user.id);
  if (!status) return { error: "Nenhuma conta Stripe conectada ainda." };
  return { success: true as const, ...status };
}
