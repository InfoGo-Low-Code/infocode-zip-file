import { readFile, utils } from 'xlsx'
import { produtosSchema, ProdutosSchema } from '@/schemas/produtoSchema'
import { z } from 'zod'

export const produtoResponseSchema = produtosSchema.extend({
  Comercializado: z.string().optional(),
})

export type ProdutoResponseSchema = z.infer<typeof produtoResponseSchema>

export function parserProdutos(filePath: string): ProdutoResponseSchema[] {
  const workbook = readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  const dataXlsx: ProdutosSchema[] = utils.sheet_to_json(worksheet, {
    header: [
      'Marca',
      'Linha',
      'Produto',
      'Posição',
      'Obs',
      'Comercializado',
      'Site',
    ],
    range: 1,
  })

  const produtos: ProdutoResponseSchema[] = dataXlsx.map((produto) => ({
    Marca: produto.Marca ? String(produto.Marca) : undefined,
    Linha: produto.Linha ? String(produto.Linha) : undefined,
    Posição: produto.Posição ? String(produto.Posição) : undefined,
    Site: produto.Site ? String(produto.Site) : '',
    Obs: produto.Obs ? String(produto.Obs) : '',
    Produto: produto.Produto ? String(produto.Produto) : undefined,
    Comercializado:
      produto.Comercializado === true
        ? 'VERDADEIRO'
        : produto.Comercializado === false
          ? 'FALSO'
          : produto.Comercializado,
  }))

  return produtos
}
