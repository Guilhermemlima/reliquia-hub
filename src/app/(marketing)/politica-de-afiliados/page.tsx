import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de afiliados" };

export default function AffiliatePolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 font-heading text-3xl font-semibold">
        Política de afiliados e transparência comercial
      </h1>

      <div className="space-y-6 text-muted-foreground">
        <p>
          Alguns links exibidos no Relíquia Hub — em especial no{" "}
          <strong className="text-foreground">Montador de PC</strong> e nas{" "}
          <strong className="text-foreground">páginas de jogos</strong> — são
          links de afiliados de lojas parceiras. O Relíquia Hub pode receber
          uma comissão quando uma compra é realizada por meio desses links,
          sem custo adicional para você.
        </p>

        <section>
          <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
            O que o Relíquia Hub faz
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Compara ofertas cadastradas de lojas parceiras.</li>
            <li>Exibe preço, condições e data da última verificação.</li>
            <li>Registra o clique quando você é redirecionado para a loja.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
            O que a loja parceira é responsável por
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Pagamento, parcelamento e frete.</li>
            <li>Estoque e disponibilidade do produto.</li>
            <li>Nota fiscal, garantia e política de devolução.</li>
            <li>Atendimento ao cliente sobre o pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
            Importante
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Preços e estoque podem mudar a qualquer momento na loja parceira.</li>
            <li>A compra é concluída inteiramente no site da loja parceira.</li>
            <li>
              O Relíquia Hub não controla nem se responsabiliza por entrega,
              garantia ou atendimento pós-venda de lojas parceiras.
            </li>
            <li>
              Sempre confirme preço, condições e disponibilidade no site da
              loja antes de finalizar a compra.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
            Privacidade do rastreamento de cliques
          </h2>
          <p>
            Ao clicar em um link de oferta, registramos apenas um identificador
            de sessão anônimo (sem nome, e-mail ou outros dados pessoais), a
            página de origem e o tipo de dispositivo, para entender quais
            ofertas são mais úteis. Esse registro não identifica você
            pessoalmente.
          </p>
        </section>
      </div>
    </div>
  );
}
