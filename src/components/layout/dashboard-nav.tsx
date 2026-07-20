"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  MessageCircle,
  PackageSearch,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard/listings", label: "Meus anúncios", icon: Store },
  { href: "/dashboard/orders", label: "Compras e vendas", icon: PackageSearch },
  { href: "/dashboard/favorites", label: "Favoritos", icon: Heart },
  { href: "/dashboard/messages", label: "Mensagens", icon: MessageCircle },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardHeaderLink() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LayoutDashboard className="size-5 text-primary" />
      <span className="font-heading text-lg font-semibold">Painel</span>
    </Link>
  );
}
