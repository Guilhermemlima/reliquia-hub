import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listConversationsForUser } from "@/modules/chat/service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Mensagens" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await listConversationsForUser(session.user.id);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Mensagens</h1>
      {conversations.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma conversa ainda. Encontre um item e fale com o vendedor!
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const other =
              conversation.buyerId === session.user.id
                ? conversation.seller
                : conversation.buyer;
            const lastMessage = conversation.messages[0];
            return (
              <Link key={conversation.id} href={`/dashboard/messages/${conversation.id}`}>
                <Card className="transition-colors hover:bg-muted/40">
                  <CardContent className="flex items-center gap-3 py-3">
                    <Avatar className="size-10">
                      <AvatarImage src={other.image ?? undefined} />
                      <AvatarFallback>
                        {(other.name ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{other.name}</p>
                        {lastMessage && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conversation.listing && (
                        <p className="truncate text-xs text-primary">
                          {conversation.listing.title}
                        </p>
                      )}
                      <p className="truncate text-sm text-muted-foreground">
                        {lastMessage?.body ?? "Nenhuma mensagem ainda"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
