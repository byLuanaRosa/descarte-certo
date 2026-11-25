import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito_Sans } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProvedorAdmin } from "@/components/ModoAdmin";
import { SCRIPT_TEMA } from "@/lib/tema";
import "./globals.css";

const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin"], weight: ["600", "700", "800"] });
const nunito = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Descarte Certo – descarte seguro em Florianópolis",
    template: "%s | Descarte Certo",
  },
  description:
    "Saiba como e onde descartar pilhas, lâmpadas, eletrônicos, remédios, óleo e recicláveis na Grande Florianópolis.",
  applicationName: "Descarte Certo",
};

export const viewport: Viewport = {
  themeColor: "#2f7a4b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-tema="claro"
      suppressHydrationWarning
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#conteudo"
          className="sr-only z-[2000] rounded bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
        >
          Pular para o conteúdo
        </a>
        <ProvedorAdmin>
          <Header />
          <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </ProvedorAdmin>
      </body>
    </html>
  );
}
