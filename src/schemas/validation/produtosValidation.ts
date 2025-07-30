import { z } from 'zod'

export const produtosValidation = z.object({
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
  Produto: z
    .string({ message: 'O campo Produto não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Produto não pode ser vazio',
    }),
  Posição: z
    .string({ message: 'O campo Posição não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Posição não pode ser vazio',
    }),
  Obs: z.string({ message: 'O campo Obs não pode ser vazio' }),
  Comercializado: z.enum(['VERDADEIRO', 'FALSO'], {
    message: 'O campo Comercializado deve ser VERDADEIRO ou FALSO',
  }),
  Site: z.union([
    z.string().url('A URL deve ser válida'),
    z.enum([''], { message: 'A URL deve ser vazia ou válida' }),
  ]),
})
