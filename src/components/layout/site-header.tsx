import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllCategoriesFlat } from "@/modules/categories/queries";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/layout/search-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu, GuestActions } from "@/components/layout/user-menu";

export async function SiteHeader() {
  const [session, categories] = await Promise.all([
    auth(),
    getAllCategoriesFlat(),
  ]);

  const topCategories = categories.filter((c) => !c.parentId).slice(0, 7);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo-full.png"
            alt="Relíquia Hub"
            width={1690}
            height={955}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <SearchBar className="hidden max-w-xl flex-1 md:block" />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            className="hidden sm:inline-flex"
            render={<Link href="/sell/new" />}
          >
            <Plus /> Anunciar
          </Button>
          <ThemeToggle />
          {session?.user ? (
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
              role={session.user.role}
            />
          ) : (
            <GuestActions />
          )}
        </div>
      </div>
      <div className="scrollbar-none container mx-auto flex gap-4 overflow-x-auto px-4 pb-3 text-sm">
        <Link
          href="/montador"
          className="shrink-0 font-medium text-primary transition-colors hover:text-primary/80"
        >
          Montador de PC
        </Link>
        <Link
          href="/jogos"
          className="shrink-0 font-medium text-primary transition-colors hover:text-primary/80"
        >
          Jogos
        </Link>
        {topCategories.map((category) => (
          <Link
            key={category.id}
            href={`/search?category=${category.slug}`}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
