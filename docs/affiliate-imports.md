# Importação de ofertas via CSV

Tela: `/admin/afiliados/importar` (`src/app/admin/afiliados/importar/page.tsx`).
Lógica: `src/modules/affiliate/csv.ts` (parser) +
`src/modules/affiliate/import-service.ts` (validação e gravação).

## Formato do arquivo

Cabeçalho obrigatório (nessa ordem não importa, mas os nomes precisam bater
exatamente):

```
part_slug,part_title,ean,mpn,part_brand,part_model,store_slug,seller_name,price,pix_price,shipping_price,condition,availability,original_url,affiliate_url
```

| Coluna | Obrigatória? | Descrição |
| --- | --- | --- |
| `part_slug` | Não* | Slug exato de uma peça já cadastrada (`Part.slug`). Se preenchido, todas as colunas de matching abaixo são ignoradas. |
| `part_title` | Não* | Título do produto como aparece na loja — usado como rótulo da linha e para associação por nome aproximado. |
| `ean` | Não* | Código de barras — maior prioridade de associação automática. |
| `mpn` | Não* | Número de peça do fabricante — segunda prioridade. |
| `part_brand` / `part_model` | Não* | Usados juntos para associação por marca+modelo (terceira prioridade). |
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
5. **< 50%** (nenhum candidato) → linha marcada como erro.

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
