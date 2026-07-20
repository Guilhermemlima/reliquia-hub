import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getConversationForUser,
  getMessages,
} from "@/modules/chat/service";
import { ChatThread } from "@/components/chat/chat-thread";

export const metadata: Metadata = { title: "Conversa" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversation = await getConversationForUser(id, session.user.id);
  if (!conversation) notFound();

  const messages = await getMessages(id);
  const other =
    conversation.buyerId === session.user.id
      ? conversation.seller
      : conversation.buyer;

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-heading text-2xl font-semibold">{other.name}</h1>
        {conversation.listing && (
          <Link
            href={`/listings/${conversation.listing.slug}`}
            className="text-sm text-primary"
          >
            Sobre: {conversation.listing.title}
          </Link>
        )}
      </div>
      <ChatThread
        conversationId={id}
        currentUserId={session.user.id}
        initialMessages={messages.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
