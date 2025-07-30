import { z } from 'zod'

export const comunizadosValidation = z.object({
  Produto: z
    .string({ message: 'O campo Produto não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Produto não pode ser vazio',
    }),
  CodigoProdutoSimilar: z
    .string({ message: 'O campo CodigoProdutoSimilar não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo CodigoProdutoSimilar não pode ser vazio',
    }),
  Descricao: z
    .string({ message: 'O campo Descricao não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Descricao não pode ser vazio',
    }),
  Comercializado: z.enum(['VERDADEIRO', 'FALSO'], {
    message: 'O Campo Comercializado deve ser VERDADEIRO ou FALSO',
  }),
})
