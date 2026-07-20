import Link from "next/link";
import { Gem } from "lucide-react";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Gem className="size-6 text-primary" />
            <span className="font-heading text-lg font-semibold">
              Relíquia Hub
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {session?.user && (
              <UserMenu
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
                role={session.user.role}
              />
            )}
          </div>
        </div>
      </header>
      <div className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <DashboardNav />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
