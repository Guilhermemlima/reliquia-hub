import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Relíquia Hub — o marketplace dos colecionadores",
    template: "%s | Relíquia Hub",
  },
  description:
    "Compre e venda videogames antigos, cards, action figures, quadrinhos, moedas, vinis e outros itens de coleção com segurança, reputação e curadoria de colecionadores.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Relíquia Hub",
    title: "Relíquia Hub — o marketplace dos colecionadores",
    description:
      "O marketplace feito para colecionadores: compre e venda com segurança, reputação e curadoria.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relíquia Hub",
    description: "O marketplace dos colecionadores.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={200}>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
