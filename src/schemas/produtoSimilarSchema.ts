import { z } from 'zod'

export const produtoSimilarSchema = z.object({
  Produto: z.coerce.string(),
  CodigoProdutoSimilar: z.string(),
  Descricao: z.string(),
  Comercializado: z.boolean(),
})

export type ProdutoSimilarSchema = z.infer<typeof produtoSimilarSchema>
