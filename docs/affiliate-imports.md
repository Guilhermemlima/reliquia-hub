# Importação de ofertas via CSV

Tela: `/admin/afiliados/importar` (`src/app/admin/afiliados/importar/page.tsx`).
Lógica: `src/modules/affiliate/csv.ts` (parser) +
`src/modules/affiliate/import-service.ts` (validação e gravação).

## Formato do arquivo

Cabeçalho obrigatório (nessa ordem não importa, mas os nomes precisam bater
exatamente):

```
part_slug,part_title,part_category,ean,mpn,part_brand,part_model,store_slug,seller_name,price,pix_price,shipping_price,condition,availability,original_url,affiliate_url
```

| Coluna | Obrigatória? | Descrição |
| --- | --- | --- |
| `part_slug` | Não* | Slug exato de uma peça já cadastrada (`Part.slug`). Se preenchido, todas as colunas de matching abaixo são ignoradas. |
| `part_title` | Não* | Título do produto. Se vazio e a peça for nova, o sistema tenta usar o título público da página (`og:title`) do `original_url`. |
| `part_category` | Não** | `CPU`, `GPU`, `RAM`, `STORAGE`, `PSU`, `MOTHERBOARD`, `CASE`, `COOLER`, `MONITOR` ou `PERIPHERAL`. Só é usada (e só é obrigatória) quando a peça precisa ser **criada** — se já existir no catálogo, é ignorada. |
| `ean` | Não* | Código de barras — maior prioridade de associação automática. |
| `mpn` | Não* | Número de peça do fabricante — segunda prioridade. |
| `part_brand` / `part_model` | Não* | Usados juntos para associação por marca+modelo (terceira prioridade) e como nome da peça nova, se `part_title` estiver vazio. |
| `store_slug` | **Sim** | Slug de uma loja já cadastrada (`Store.slug`). |
| `seller_name` | Não | Texto livre, exibido na oferta. |
| `price` | **Sim** | Preço normal, número positivo (ex: `649.90`). |
| `pix_price`, `shipping_price` | Não | Números; `shipping_price = 0` significa frete grátis. |
| `condition` | Não | `NEW`, `USED` ou `REFURBISHED` — qualquer outro valor vira `NEW`. |
| `availability` | Não | `IN_STOCK`, `OUT_OF_STOCK` ou `UNKNOWN` — padrão `UNKNOWN`. |
| `original_url` | **Sim** | URL do produto na loja. Precisa ser `https://` e bater com um domínio de `Store.allowedDomains`. |
| `affiliate_url` | Não | Se vazio, a oferta usa `original_url` como link de compra. |

\* `part_slug` **ou** (`ean`/`mpn`/`part_brand`+`part_model`/`part_title`)
precisa estar preenchido — sem nenhum sinal de identificação, a linha vira
erro.
\*\* obrigatória só no caso de a peça não existir ainda e não ter sido
encontrada por nenhum método de associação.

## Imagem e nome automáticos (prévia do link)

Quando falta uma informação, `modules/affiliate/link-preview.ts` busca a
prévia pública do `original_url` (as mesmas tags `og:title`/`og:image` que
WhatsApp/Slack usam pra gerar preview de link — **não** é scraping de
preço/estoque, só metadado que a própria página já expõe pra esse fim):

- **Nome**: usado só como último recurso, se `part_title` **e**
  `part_brand`+`part_model` estiverem vazios. O que você preenche
  manualmente sempre tem prioridade.
- **Imagem**: sempre que a peça (nova ou já existente) ainda não tiver
  `imageUrl`, o sistema tenta preencher a partir da prévia do link.

Isso é best-effort — algumas lojas bloqueiam esse tipo de requisição
automatizada. Quando falha, a linha é processada normalmente, só sem
imagem/título automáticos (você edita depois em `/admin/afiliados/ofertas`).

## Como a peça é resolvida

1. Se `part_slug` vier preenchido → precisa bater exatamente com uma peça
   existente, senão a linha é erro.
2. Se vier vazio → `modules/affiliate/matching.ts` tenta, em ordem:
   EAN exato (98%) → MPN exato (97%) → marca+modelo normalizados iguais
   (87%) → nome aproximado por sobreposição de palavras (até 95%, mínimo
   50% para valer como candidato).
3. **≥ 90% de confiança** → oferta criada direto, sem revisão.
4. **Entre 50% e 90%** → vira uma entrada em `/admin/afiliados/revisao`
   (nenhuma oferta é criada até um admin aprovar).
5. **Nenhum candidato encontrado**: se `part_category` for válida e houver
   `part_title` ou `part_brand`+`part_model`, uma **peça nova é criada**
   no catálogo (com imagem/nome da prévia do link quando faltar) e a
   oferta é criada direto — sem revisão, já que não havia ambiguidade pra
   revisar. Sem `part_category` válida, a linha vira erro.

## Duplicidade

Uma linha é considerada duplicata (e simplesmente ignorada, sem erro) se já
existir uma `Offer` com a mesma peça, loja e `original_url`. Isso permite
reimportar o mesmo arquivo sem criar ofertas repetidas.

## Limites

- Até **500 linhas** por importação (`MAX_IMPORT_ROWS`). Arquivos maiores
  precisam ser divididos em partes.
- O processamento é síncrono (sem fila em segundo plano) — para volumes
  muito maiores que isso, ou para chamadas a APIs externas com necessidade
  de retry/backoff, será necessário implementar uma fila de jobs (ver
  "Próximos passos" no `affiliate-system-plan.md`).

## Resultado da importação

Depois de confirmar, a tela mostra: total processado, criadas, já
existentes, enviadas para revisão e com erro — e, para cada linha que não
foi "criada", a mensagem específica do que aconteceu (peça não encontrada,
domínio não autorizado, preço inválido, etc).
