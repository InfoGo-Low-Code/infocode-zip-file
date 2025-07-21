import { z } from 'zod'

export const produtosSchema = z.object({
  Marca: z.string(),
  Linha: z.string(),
  Produto: z.coerce.string(),
  Posição: z.string(),
  Obs: z.string().default(''),
  Comercializado: z.boolean(),
  Site: z.string().default(''),
})

export type ProdutosSchema = z.infer<typeof produtosSchema>
