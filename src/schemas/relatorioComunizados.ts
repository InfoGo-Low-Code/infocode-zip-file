import { z } from 'zod'

export const relatorioComunizados = z.object({
  Marca: z.string().optional(),
  Linha: z.string().optional(),
  Segmento: z.string().optional(),
  Produto_Comunizado: z.string().optional(),
  Produto_Comunizou: z.string().optional(),
  Posição: z.string().optional(),
  Obs: z.string().optional(),
})

export type RelatorioComunizados = z.infer<typeof relatorioComunizados>
