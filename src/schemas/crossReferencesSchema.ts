import { z } from 'zod'

export const crossReferencesSchema = z.object({
  Produto: z.coerce.string(),
  DescFabricante: z.string(),
  NumeroProdutoPesq: z.coerce.string(),
})

export type CrossReferencesSchema = z.infer<typeof crossReferencesSchema>
