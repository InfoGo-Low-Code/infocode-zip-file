import { getCofapConnection } from '@/database'
import { z } from 'zod'

export const ProdutoSimilarSchema = z.object({
  ID: z.string(),
  MARCA: z.string(),
  LINHA: z.string(),
  'CÓDIGO (DE)': z.string(),
  'CÓDIGO (PARA)': z.string(),
  DESCRICAO: z.string(),
})

export const VersoesSchema = z.object({
  ID: z.string(),
  MARCA: z.string(),
  LINHA: z.string(),
  SUPER: z.string(),
  TURBOGAS: z.string(),
  'SPA SUPER': z.string(),
  'SPA TURBOGAS': z.string(),
  'SUPER - Ø 45MM': z.string(),
  'SUPER - Ø 35MM': z.string(),
  AÇO: z.string(),
  NYLON: z.string(),
  POSIÇÃO: z.string(),
})

export const ComunizadosSchema = z.object({
  ID: z.string(),
  MARCA: z.string(),
  LINHA: z.string(),
  SEGMENTO: z.string(),
  'PRODUTO COMUNIZADO': z.string(),
  'PRODUTO QUE O COMUNIZOU': z.string(),
  POSIÇÃO: z.string(),
  OBS: z.string(),
})

export const SchemasMap = {
  RACIONALIZADOS: ProdutoSimilarSchema,
  'MUDANÇA DE CÓDIGOS': ProdutoSimilarSchema,
  VERSÕES: VersoesSchema,
  COMUNIZADOS: ComunizadosSchema,
} as const

export type QueryResultMap = {
  [K in keyof typeof SchemasMap]: z.infer<(typeof SchemasMap)[K]>
}

export type WithoutID<T> = Omit<T, 'ID'>

export const tables = z.enum([
  'RACIONALIZADOS',
  'MUDANÇA DE CÓDIGOS',
  'VERSÕES',
  'COMUNIZADOS',
])

export type Tables = z.infer<typeof tables>

export async function runQuery<K extends keyof QueryResultMap>(
  query: string,
): Promise<WithoutID<QueryResultMap[K]>[]> {
  const db = await getCofapConnection()

  const { recordset } = await db.query<QueryResultMap[K]>(query)

  const filtered: WithoutID<QueryResultMap[K]>[] = recordset.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ ID, ...rest }) => rest,
  )

  return filtered
}
