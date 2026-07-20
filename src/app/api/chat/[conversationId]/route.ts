import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getConversationForUser,
  getMessages,
  postMessage,
} from "@/modules/chat/service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  const conversation = await getConversationForUser(
    conversationId,
    session.user.id
  );
  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const messages = await getMessages(conversationId);
  return NextResponse.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  const conversation = await getConversationForUser(
    conversationId,
    session.user.id
  );
  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const message = await postMessage(conversationId, session.user.id, text);
  return NextResponse.json({ message });
}
