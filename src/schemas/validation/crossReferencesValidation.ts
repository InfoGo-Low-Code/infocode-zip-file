import { z } from 'zod'

export const crossReferencesValidation = z.object({
  Produto: z
    .string({ message: 'O campo Produto não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Produto não pode ser vazio',
    }),
  DescFabricante: z
    .string({ message: 'O campo DescFabricante não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo DescFabricante não pode ser vazio',
    }),
  NumeroProdutoPesq: z
    .string({ message: 'O campo NumeroProdutoPesq não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo NumeroProdutoPesq não pode ser vazio',
    }),
})
