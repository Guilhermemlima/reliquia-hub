import Link from "next/link";
import { Gem } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 px-4 py-12">
      <Link
        href="/"
        className="flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight"
      >
        <Gem className="size-6 text-primary" />
        Relíquia Hub
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
