import { z } from 'zod'
import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { fastifyErrorResponseSchema } from '@/schemas/errors/fastifyErrorResponseSchema'
import { zodErrorBadRequestResponseSchema } from '@/schemas/errors/zodErrorBadRequestSchema'
import { getCofapConnection } from '@/database'
import { ConnectionPool, IResult } from 'mssql'
import {
  endRoute,
  getProgress,
  setUserUpdate,
  startRoute,
  updateProgress,
} from '@/utils/routeStage'

async function getAmmountAndTruncate(db: ConnectionPool, table: string) {
  const countResult: IResult<{ total: number }> = await db.query(
    `SELECT COUNT(*) AS total FROM ${table}`,
  )
  await db.query(`TRUNCATE TABLE ${table}`)

  const deleted_data = countResult.recordset?.[0]?.total ?? 0

  return deleted_data
}

export function truncateInfo(app: FastifyZodTypedInstance) {
  app.get(
    '/truncateInfo',
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            deleted_racionalizados: z.number(),
            deleted_comunizados: z.number(),
            deleted_troca_codigo: z.number(),
            deleted_versoes: z.number(),
            deleted_cross_references: z.number(),
            deleted_produtos: z.number(),
          }),
          400: zodErrorBadRequestResponseSchema,
          500: fastifyErrorResponseSchema,
        },
      },
    },
    async (_, reply) => {
      startRoute('truncateInfo')

      const db = await getCofapConnection()

      try {
        updateProgress({
          message: 'Deletando registros Racionalizados',
          percentage: getProgress().percentage + 5,
        })
        const deleted_racionalizados = await getAmmountAndTruncate(
          db,
          'RACIONALIZADOS',
        )

        updateProgress({
          message: 'Deletando registros Comunizados',
          percentage: getProgress().percentage + 5,
        })
        const deleted_comunizados = await getAmmountAndTruncate(
          db,
          'COMUNIZADOS_COMUNIZOU',
        )

        updateProgress({
          message: 'Deletando registros de Troca de Códigos',
          percentage: getProgress().percentage + 5,
        })
        const deleted_troca_codigo = await getAmmountAndTruncate(
          db,
          'TROCA_CODIGO',
        )

        updateProgress({
          message: 'Deletando registros de Versões',
          percentage: getProgress().percentage + 5,
        })
        const deleted_versoes = await getAmmountAndTruncate(db, 'VERSOES')

        updateProgress({
          message: 'Deletando registros de Cross References',
          percentage: getProgress().percentage + 5,
        })
        const deleted_cross_references = await getAmmountAndTruncate(
          db,
          'CROSS_REFERENCES',
        )

        updateProgress({
          message: 'Deletando registros de Produtos',
          percentage: getProgress().percentage + 5,
        })
        const deleted_produtos = await getAmmountAndTruncate(db, 'PRODUTOS')

        return reply.send({
          message: 'Registros deletados com sucesso',
          deleted_racionalizados,
          deleted_comunizados,
          deleted_troca_codigo,
          deleted_versoes,
          deleted_cross_references,
          deleted_produtos,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return reply.internalServerError(
          `Erro ao executar comandos TRUNCATE: ${error.message}`,
        )
      } finally {
        setUserUpdate('')
        endRoute('truncateInfo')
      }
    },
  )
}
