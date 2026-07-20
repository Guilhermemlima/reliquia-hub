import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, LayoutDashboard, Flag, Store, Users, Link2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/listings", label: "Anúncios", icon: Store },
  { href: "/admin/afiliados", label: "Afiliados", icon: Link2 },
  { href: "/admin/reports", label: "Denúncias", icon: Flag },
  { href: "/admin/users", label: "Usuários", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            <span className="font-heading text-lg font-semibold">
              Painel administrativo
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Voltar ao site
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
