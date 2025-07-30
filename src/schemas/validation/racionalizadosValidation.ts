import { z } from 'zod'

export const racionalizadosValidation = z.object({
  Produto: z
    .string({ message: 'O campo Produto não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo Produto não pode ser vazio',
    }),
  CodigoProduto: z
    .string({ message: 'O campo CodigoProduto não pode ser vazio' })
    .refine((value) => value.trim().length > 0, {
      message: 'O campo CodigoProduto não pode ser vazio',
    }),
  Descricao: z.enum(['RACIONALIZADO'], {
    message: 'O campo Descricao deve ter o valor RACIONALIZADO',
  }),
  Comercializado: z.enum(['VERDADEIRO', 'FALSO'], {
    message: 'O Campo Comercializado deve ser VERDADEIRO ou FALSO',
  }),
})
