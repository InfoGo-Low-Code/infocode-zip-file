import {
  RelatorioComunizados,
  relatorioComunizados,
} from '@/schemas/relatorioComunizados'
import { readFile, utils } from 'xlsx'
import { z } from 'zod'

export const relatorioComunizadosResponseSchema = relatorioComunizados

export type RelatorioComunizadosResponseSchema = z.infer<
  typeof relatorioComunizadosResponseSchema
>

export function parserRelatorioComunizados(
  filePath: string,
): RelatorioComunizadosResponseSchema[] {
  const workbook = readFile(filePath)
  const sheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetname]

  const dataXlsx: RelatorioComunizados[] = utils.sheet_to_json(worksheet, {
    header: [
      'Marca',
      'Linha',
      'Segmento',
      'Produto_Comunizado',
      'Produto_Comunizou',
      'Posição',
      'Obs',
    ],
    range: 1,
  })

  const produtos: RelatorioComunizados[] = dataXlsx.map((produto) => ({
    Marca: produto.Marca ? produto.Marca : '',
    Linha: produto.Linha ? produto.Linha : '',
    Segmento: produto.Segmento ? produto.Segmento : '',
    Produto_Comunizado: produto.Produto_Comunizado
      ? String(produto.Produto_Comunizado)
      : '',
    Produto_Comunizou: produto.Produto_Comunizou
      ? String(produto.Produto_Comunizou)
      : '',
    Posição: produto.Posição ? produto.Posição : '',
    Obs: produto.Obs ? produto.Obs : '',
  }))

  return produtos
}
