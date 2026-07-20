import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateConversation } from "@/modules/chat/service";

export default async function NewConversationPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const { listingId } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!listingId) redirect("/dashboard/messages");

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true },
  });
  if (!listing) notFound();

  if (listing.sellerId === session.user.id) {
    redirect("/dashboard/messages");
  }

  const conversation = await getOrCreateConversation({
    buyerId: session.user.id,
    sellerId: listing.sellerId,
    listingId: listing.id,
  });

  redirect(`/dashboard/messages/${conversation.id}`);
}
