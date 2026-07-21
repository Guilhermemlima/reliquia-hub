import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    title: "Relíquia Hub",
    links: [
      { label: "Sobre", href: "/" },
      { label: "Fórum de colecionadores", href: "/forum" },
      { label: "Vendedores verificados", href: "/search?verified=1" },
    ],
  },
  {
    title: "Comprar",
    links: [
      { label: "Buscar itens", href: "/search" },
      { label: "Como funciona o pagamento seguro", href: "/" },
      { label: "Denunciar um anúncio", href: "/" },
    ],
  },
  {
    title: "Vender",
    links: [
      { label: "Anunciar item", href: "/sell/new" },
      { label: "Painel do vendedor", href: "/dashboard/listings" },
      { label: "Assinatura Premium", href: "/" },
    ],
  },
  {
    title: "Montador de PC",
    links: [
      { label: "Montar um PC", href: "/montador" },
      { label: "Jogos", href: "/jogos" },
      { label: "Política de afiliados", href: "/politica-de-afiliados" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="container mx-auto grid gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Image
            src="/logo-full.png"
            alt="Relíquia Hub"
            width={1690}
            height={955}
            className="h-8 w-auto"
          />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            O marketplace feito para colecionadores comprarem e venderem com
            segurança e reputação.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-semibold">{column.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Relíquia Hub. Feito para colecionadores.
      </div>
    </footer>
  );
}
