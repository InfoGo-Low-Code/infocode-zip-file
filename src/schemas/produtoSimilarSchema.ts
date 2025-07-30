import { z } from 'zod'

export const produtoSimilarSchema = z.object({
  Produto: z.string().optional(),
  CodigoProdutoSimilar: z.string().optional(),
  Descricao: z.string().optional(),
  Comercializado: z.boolean().optional(),
})

export type ProdutoSimilarSchema = z.infer<typeof produtoSimilarSchema>
