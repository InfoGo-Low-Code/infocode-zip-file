import { z } from 'zod'
import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { fastifyErrorResponseSchema } from '@/schemas/errors/fastifyErrorResponseSchema'
import { zodErrorBadRequestResponseSchema } from '@/schemas/errors/zodErrorBadRequestSchema'

import { racionalizadosResponseSchema } from '@/utils/parserRacionalizados'
import { produtoResponseSchema } from '@/utils/parserProduto'
import { produtoSimilarResponseSchema } from '@/utils/parserCodigoSimilar'
import { crossReferencesSchema } from '@/schemas/crossReferencesSchema'
import { getCofapConnection } from '@/database'
import { readFileSync, unlinkSync } from 'node:fs'
import { ConnectionPool, Request } from 'mssql'
import { differenceInMilliseconds } from 'date-fns'
import {
  endRoute,
  getProgress,
  setUpdateInfo,
  setUserUpdate,
  startRoute,
  updateProgress,
} from '@/utils/routeStage'
import { datetimeParserCustom } from '@/utils/datetimeParserCustom'

export const responseInsert = z.object({
  message: z.string(),
  inserted_racionalizados: z.number(),
  racionalizados_time_in_ms: z.number(),
  inserted_comunizados: z.number(),
  comunizados_time_in_ms: z.number(),
  inserted_troca_codigo: z.number(),
  troca_codigo_time_in_ms: z.number(),
  inserted_versoes: z.number(),
  versoes_time_in_ms: z.number(),
  inserted_cross_references: z.number(),
  cross_references_time_in_ms: z.number(),
  inserted_produtos: z.number(),
  produtos_time_in_ms: z.number(),
  end_date_time_racionalizados: z.string(),
  end_date_time_comunizados: z.string(),
  end_date_time_troca_codigo: z.string(),
  end_date_time_versoes: z.string(),
  end_date_time_cross_references: z.string(),
  end_date_time_produtos: z.string(),
  deleted_racionalizados: z.number(),
  deleted_comunizados: z.number(),
  deleted_troca_codigo: z.number(),
  deleted_versoes: z.number(),
  deleted_cross_references: z.number(),
  deleted_produtos: z.number(),
})

export type ResponseInsert = z.infer<typeof responseInsert>

const jsonData = z.object({
  racionalizados: z.array(racionalizadosResponseSchema),
  comunizados: z.array(produtoSimilarResponseSchema),
  troca_codigo: z.array(produtoSimilarResponseSchema),
  versoes: z.array(produtoSimilarResponseSchema),
  cross_references: z.array(crossReferencesSchema),
  produtos: z.array(produtoResponseSchema),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const arrayInsertSchema = z.array(
  z.union([
    racionalizadosResponseSchema,
    produtoSimilarResponseSchema,
    crossReferencesSchema,
    produtoResponseSchema,
  ]),
)

type ArrayInsertSchema = z.infer<typeof arrayInsertSchema>

function toSQLInsert(array: ArrayInsertSchema, table: string): string[] {
  const sqlInserts = array.map((item) => {
    const campos = Object.keys(item)
    const values = Object.values(item)

    const insertColumns = campos.join(', ')
    const insertValues = values.map((value) => `'${value}'`).join(', ')

    return `INSERT INTO ${table} (${insertColumns}) VALUES (${insertValues})`
  })

  return sqlInserts
}

async function runBatchInChunks(
  comandos: string[],
  table: string,
  db: ConnectionPool,
  chunkSize = 1000,
): Promise<{
  inserted_data: number
  execution_time_ms: number
  end_date_time: string
}> {
  const startTime = new Date()
  let inserted_data = 0
  const chunks = Array.from(
    { length: Math.ceil(comandos.length / chunkSize) },
    (_, i) => comandos.slice(i * chunkSize, (i + 1) * chunkSize),
  )

  const request = new Request(db)
  await request.batch(`TRUNCATE TABLE ${table}`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    try {
      const response = await request.batch(chunk.join('\n'))
      if (Array.isArray(response.rowsAffected)) {
        inserted_data += response.rowsAffected.reduce((acc, v) => acc + v, 0)
      }
    } catch (err) {
      console.error(`Erro ao inserir chunk ${i}:`, err)
      throw err
    }
  }

  const execution_time_ms = differenceInMilliseconds(new Date(), startTime)

  const end_date_time = datetimeParserCustom(new Date())

  return { inserted_data, execution_time_ms, end_date_time }
}

export function dbInsertProduction(app: FastifyZodTypedInstance) {
  app.post(
    '/dbInsertProduction',
    {
      schema: {
        body: z.object({
          uuid: z.string().uuid(),
          racionalizados_time_in_ms: z.number(),
          comunizados_time_in_ms: z.number(),
          troca_codigo_time_in_ms: z.number(),
          versoes_time_in_ms: z.number(),
          cross_references_time_in_ms: z.number(),
          produtos_time_in_ms: z.number(),
          deleted_racionalizados: z.number(),
          deleted_comunizados: z.number(),
          deleted_troca_codigo: z.number(),
          deleted_versoes: z.number(),
          deleted_cross_references: z.number(),
          deleted_produtos: z.number(),
        }),
        response: {
          200: responseInsert,
          400: zodErrorBadRequestResponseSchema,
          500: fastifyErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      startRoute('dbInsert')

      const {
        uuid,
        racionalizados_time_in_ms,
        comunizados_time_in_ms,
        troca_codigo_time_in_ms,
        versoes_time_in_ms,
        cross_references_time_in_ms,
        produtos_time_in_ms,
        deleted_racionalizados,
        deleted_comunizados,
        deleted_troca_codigo,
        deleted_versoes,
        deleted_cross_references,
        deleted_produtos,
      } = request.body

      const db = await getCofapConnection()

      const filePath = `./uploads/${uuid}.json`

      const fileContent = readFileSync(filePath, 'utf-8')
      const data = JSON.parse(fileContent)

      const {
        racionalizados,
        comunizados,
        troca_codigo,
        versoes,
        cross_references,
        produtos,
      } = jsonData.parse(data)

      const comandosRacionalizados: string[] = toSQLInsert(
        racionalizados,
        'RACIONALIZADOS',
      )
      const comandosComunizados: string[] = toSQLInsert(
        comunizados,
        'COMUNIZADOS_COMUNIZOU',
      )
      const comandosTrocaCodigo: string[] = toSQLInsert(
        troca_codigo,
        'TROCA_CODIGO',
      )
      const comandosVersoes: string[] = toSQLInsert(versoes, 'VERSOES')
      const comandosCrossReferences: string[] = toSQLInsert(
        cross_references,
        'CROSS_REFERENCES',
      )
      const comandosProdutos: string[] = toSQLInsert(produtos, 'PRODUTOS')

      try {
        updateProgress({
          message: 'Inserindo novos registros Racionalizados',
          percentage: getProgress().percentage + 5,
        })

        const {
          execution_time_ms: racionalizadosTime,
          inserted_data: inserted_racionalizados,
          end_date_time: end_date_time_racionalizados,
        } = await runBatchInChunks(comandosRacionalizados, 'RACIONALIZADOS', db)

        updateProgress({
          message: 'Inserindo novos registros Comunizados',
          percentage: getProgress().percentage + 5,
        })

        const {
          execution_time_ms: comunizadosTime,
          inserted_data: inserted_comunizados,
          end_date_time: end_date_time_comunizados,
        } = await runBatchInChunks(
          comandosComunizados,
          'COMUNIZADOS_COMUNIZOU',
          db,
        )

        updateProgress({
          message: 'Inserindo novos registros de Troca de Códigos',
          percentage: getProgress().percentage + 5,
        })

        const {
          execution_time_ms: trocaCodigoTime,
          inserted_data: inserted_troca_codigo,
          end_date_time: end_date_time_troca_codigo,
        } = await runBatchInChunks(comandosTrocaCodigo, 'TROCA_CODIGO', db)

        updateProgress({
          message: 'Inserindo novos registros de Versões',
          percentage: getProgress().percentage + 5,
        })

        const {
          execution_time_ms: versoesTime,
          inserted_data: inserted_versoes,
          end_date_time: end_date_time_versoes,
        } = await runBatchInChunks(comandosVersoes, 'VERSOES', db)

        updateProgress({
          message: 'Inserindo novos registros de Cross References',
          percentage: getProgress().percentage + 5,
        })

        const {
          execution_time_ms: crossReferencesTime,
          inserted_data: inserted_cross_references,
          end_date_time: end_date_time_cross_references,
        } = await runBatchInChunks(
          comandosCrossReferences,
          'CROSS_REFERENCES',
          db,
        )

        updateProgress({
          message: 'Inserindo novos registros de Produtos',
          percentage: getProgress().percentage + 5,
        })

        const {
          execution_time_ms: produtosTime,
          inserted_data: inserted_produtos,
          end_date_time: end_date_time_produtos,
        } = await runBatchInChunks(comandosProdutos, 'PRODUTOS', db)

        unlinkSync(filePath)

        const totalTimeRacionalizados =
          racionalizadosTime + racionalizados_time_in_ms
        const totalTimeComunizados = comunizadosTime + comunizados_time_in_ms
        const totalTimeTrocaCodigo = trocaCodigoTime + troca_codigo_time_in_ms
        const totalTimeVersoes = versoesTime + versoes_time_in_ms
        const totalTimeCrossReferences =
          crossReferencesTime + cross_references_time_in_ms
        const totalTimeProdutos = produtosTime + produtos_time_in_ms

        updateProgress({
          message: 'Processo Finalizado',
          percentage: getProgress().percentage + 5,
        })

        setUpdateInfo({
          message: 'Registros inseridos com sucesso',
          inserted_racionalizados,
          racionalizados_time_in_ms: totalTimeRacionalizados,
          inserted_comunizados,
          comunizados_time_in_ms: totalTimeComunizados,
          inserted_troca_codigo,
          troca_codigo_time_in_ms: totalTimeTrocaCodigo,
          inserted_versoes,
          versoes_time_in_ms: totalTimeVersoes,
          inserted_cross_references,
          cross_references_time_in_ms: totalTimeCrossReferences,
          inserted_produtos,
          produtos_time_in_ms: totalTimeProdutos,
          end_date_time_racionalizados,
          end_date_time_comunizados,
          end_date_time_troca_codigo,
          end_date_time_versoes,
          end_date_time_cross_references,
          end_date_time_produtos,
          deleted_racionalizados,
          deleted_comunizados,
          deleted_troca_codigo,
          deleted_versoes,
          deleted_cross_references,
          deleted_produtos,
        })

        return reply.send({
          message: 'Registros inseridos com sucesso',
          inserted_racionalizados,
          racionalizados_time_in_ms: totalTimeRacionalizados,
          inserted_comunizados,
          comunizados_time_in_ms: totalTimeComunizados,
          inserted_troca_codigo,
          troca_codigo_time_in_ms: totalTimeTrocaCodigo,
          inserted_versoes,
          versoes_time_in_ms: totalTimeVersoes,
          inserted_cross_references,
          cross_references_time_in_ms: totalTimeCrossReferences,
          inserted_produtos,
          produtos_time_in_ms: totalTimeProdutos,
          end_date_time_racionalizados,
          end_date_time_comunizados,
          end_date_time_troca_codigo,
          end_date_time_versoes,
          end_date_time_cross_references,
          end_date_time_produtos,
          deleted_racionalizados,
          deleted_comunizados,
          deleted_troca_codigo,
          deleted_versoes,
          deleted_cross_references,
          deleted_produtos,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        unlinkSync(filePath)

        return reply.internalServerError(
          `Erro ao executar comandos INSERT em batch: ${error.message}`,
        )
      } finally {
        setUserUpdate('')
        endRoute('dbInsert')
      }
    },
  )
}
