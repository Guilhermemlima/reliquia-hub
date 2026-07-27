import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 px-4 py-12">
      <Link href="/" className="flex items-center">
        <Image
          src="/logo-full.png"
          alt="Relíquia Hub"
          width={666}
          height={375}
          priority
          className="h-12 w-auto"
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
