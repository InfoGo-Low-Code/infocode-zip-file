import { z } from 'zod'

export const relatorioComunizadosValidation = z.object({
  Marca: z
    .string({ message: 'O campo Marca não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Marca não pode ser vazio',
    }),
  Linha: z
    .string({ message: 'O campo Linha não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Linha não pode ser vazio',
    }),
  Segmento: z
    .string({ message: 'O campo Segmento não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Segmento não pode ser vazio',
    }),
  Produto_Comunizado: z
    .string({ message: 'O campo Produto Comunizado não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Produto Comunizado não pode ser vazio',
    }),
  Produto_Comunizou: z
    .string({ message: 'O campo Produto que o Comunizou não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Produto que o Comunizou não pode ser vazio',
    }),
  Posição: z
    .string({ message: 'O campo Posição não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Posição não pode ser vazio',
    }),
  Obs: z.string({ message: 'O campo Obs não pode ser vazio' }),
})
