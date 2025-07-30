import { z } from 'zod'

export const crossReferencesSchema = z.object({
  Produto: z.string().optional(),
  DescFabricante: z.string().optional(),
  NumeroProdutoPesq: z.string().optional(),
})

export type CrossReferencesSchema = z.infer<typeof crossReferencesSchema>
