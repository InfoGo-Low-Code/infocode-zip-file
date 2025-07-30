import { readFile, utils } from 'xlsx'
import { CrossReferencesSchema } from '@/schemas/crossReferencesSchema'

export function parserCrossReferences(
  filePath: string,
): CrossReferencesSchema[] {
  const workbook = readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  const dataXlsx: CrossReferencesSchema[] = utils.sheet_to_json(worksheet, {
    header: ['Produto', 'DescFabricante', 'NumeroProdutoPesq'],
    range: 1,
  })

  const produtos: CrossReferencesSchema[] = dataXlsx.map((produto) => ({
    Produto: produto.Produto ? String(produto.Produto) : undefined,
    DescFabricante: produto.DescFabricante
      ? String(produto.DescFabricante)
      : undefined,
    NumeroProdutoPesq: produto.NumeroProdutoPesq
      ? String(produto.NumeroProdutoPesq)
      : undefined,
  }))

  return produtos
}
