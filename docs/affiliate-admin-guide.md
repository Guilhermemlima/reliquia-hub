# Guia do admin — sistema de afiliados

Todas as telas abaixo exigem login com uma conta `role = ADMIN` (veja as
contas de teste no `README.md`).

## 1. Cadastrar uma loja

`/admin/afiliados` → botão **Nova loja**.

- **Nome**: nome de exibição (ex: "KaBuM").
- **Site** (opcional): usado como referência, não valida nada.
- **Domínios permitidos**: um por linha (ou separados por vírgula). Toda
  URL de oferta dessa loja precisa terminar num desses domínios — é a
  principal proteção contra cadastrar (ou ser enganado a cadastrar) um link
  de outro site. Ex: `kabum.com.br`, `www.kabum.com.br`.

## 2. Criar um programa de afiliados

Mesma página → botão **Novo programa**.

- Escolha a loja já cadastrada.
- **Tipo de integração**: deixe **Manual** a menos que você tenha
  implementado um provedor automático de verdade (ver
  `affiliate-providers.md`) — os outros tipos existem no formulário mas não
  têm nenhuma lógica por trás ainda.
- **Identificador de afiliado**: opcional, só um texto público de
  referência (ex: seu tracking id na rede).

O botão **Testar conexão** no card da loja chama
`AffiliateProvider.testConnection()` do provedor configurado — no modo
manual, sempre retorna sucesso instantâneo (não há nada externo para
testar).

## 3. Cadastrar uma oferta manualmente

`/admin/afiliados/ofertas` → **Nova oferta manual**.

Escolha a peça do catálogo, a loja, preço (e opcionalmente Pix, frete,
condição, estoque, vendedor) e cole a **URL original do produto**. Se você
já tiver o link de afiliado pronto, cole em **URL de afiliado** — senão,
deixe em branco que o sistema usa a própria URL original.

Se a URL não pertencer a um domínio autorizado da loja escolhida, o
cadastro é recusado com uma mensagem explicando qual domínio faltou.

## 4. Importar várias ofertas de uma vez (CSV)

`/admin/afiliados/importar` → veja `affiliate-imports.md` para o formato
completo do arquivo. Resumo do fluxo:

1. Baixe o modelo CSV (botão **Baixar modelo CSV**) para ver as colunas.
2. Selecione o arquivo — o sistema mostra uma prévia antes de importar
   nada.
3. Clique em **Importar** — nada é salvo até esse clique.
4. Veja o resumo: quantas foram criadas, quantas já existiam, quantas
   foram para revisão e quantas deram erro (com o motivo de cada uma).

## 5. Revisar associações automáticas

`/admin/afiliados/revisao` — aparece quando uma linha do CSV não tinha
`part_slug` exato e o sistema encontrou uma peça candidata com confiança
entre 50% e 90% (por EAN, MPN, marca+modelo ou nome aproximado). Para cada
linha:

- **Aprovar**: cria a oferta de verdade, usando a peça sugerida.
- **Rejeitar**: descarta a linha, nenhuma oferta é criada.

Um selo vermelho no botão **Revisão** da página `/admin/afiliados` mostra
quantas revisões estão pendentes.

## 6. Acompanhar cliques e saúde das ofertas

`/admin/afiliados/relatorios`:

- Cliques dos últimos 14 dias, por dispositivo e por página de origem
  (produto / montador / jogo / outro).
- Ofertas mais clicadas.
- Distribuição de status das ofertas (ativas/inativas/expiradas).
- **Ofertas desatualizadas**: sem verificação de preço há mais de 7 dias
  (`STALE_OFFER_DAYS` em `modules/affiliate/reports.ts` — ajuste esse
  número se quiser um limite diferente).
- **Peças sem oferta ativa**: itens do catálogo que hoje não aparecem no
  montador por falta de qualquer oferta cadastrada.

## 7. Curar o catálogo de peças peça por peça

`/admin/pecas` — pensada pra ir associando link e imagem aos poucos, sem
precisar de CSV. A tela mostra o catálogo inteiro (hoje ~2.400 peças
importadas do [BuildCores OpenDB](https://github.com/buildcores/buildcores-open-db),
que traz especificação técnica mas **não** traz preço, imagem nem link de
compra — isso fica por sua conta) com busca por nome/marca/modelo, filtro
por categoria e um filtro **"Só sem link"** pra focar no que ainda falta.

Em cada linha:

- **Ícone de lápis**: cola a URL de uma imagem do produto — fica salva na
  peça (usada em qualquer oferta dela, no montador e nas listagens de
  ofertas).
- **Associar link / Adicionar link**: abre o mesmo formulário de oferta
  manual (item 3), só que já com a peça fixada — só falta escolher a loja,
  preço e colar o link.

Pra um lançamento novo que ainda não existe no catálogo, use o botão
**Nova peça** no topo da página — cria a peça (categoria, marca, modelo,
nome e opcionalmente EAN/MPN/imagem) direto pelo admin, sem precisar de mim
nem de CSV. Depois é só associar o link normalmente.

## 8. Ativar/desativar uma loja ou uma oferta

- Loja: switch no card da loja em `/admin/afiliados`.
- Oferta: botão **Ativar/Desativar** na tabela `/admin/afiliados/ofertas`.

Desativar uma loja **não** desativa as ofertas dela automaticamente hoje —
desative as ofertas específicas se for o caso.
