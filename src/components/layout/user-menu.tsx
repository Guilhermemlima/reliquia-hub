"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Heart,
  MessageCircle,
  PackageSearch,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  name,
  email,
  image,
  role,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}) {
  const initials = (name ?? email ?? "U").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-9 cursor-pointer border">
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          {name ?? email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/listings" />}>
          <LayoutDashboard /> Meus anúncios
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/orders" />}>
          <PackageSearch /> Minhas compras
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/favorites" />}>
          <Heart /> Favoritos
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/messages" />}>
          <MessageCircle /> Mensagens
        </DropdownMenuItem>
        {role === "ADMIN" && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldCheck /> Painel admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GuestActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" render={<Link href="/login" />}>
        Entrar
      </Button>
      <Button render={<Link href="/register" />}>Cadastrar</Button>
    </div>
  );
}
