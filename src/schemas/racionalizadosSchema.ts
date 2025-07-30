import { z } from 'zod'

export const racionalizadosSchema = z.object({
  Produto: z.string().optional(),
  CodigoProduto: z.string().optional(),
  Descricao: z.string().optional(),
  Comercializado: z.boolean().optional(),
})

export type RacionalizadosSchema = z.infer<typeof racionalizadosSchema>
