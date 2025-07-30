import { z } from 'zod'

export const produtosSchema = z.object({
  Marca: z.string().optional(),
  Linha: z.string().optional(),
  Produto: z.coerce.string().optional(),
  Posição: z.string().optional(),
  Obs: z.string().optional(),
  Comercializado: z.boolean().optional(),
  Site: z.string().optional(),
})

export type ProdutosSchema = z.infer<typeof produtosSchema>
