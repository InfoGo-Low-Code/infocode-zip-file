import { z } from 'zod'
import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { fastifyErrorResponseSchema } from '@/schemas/errors/fastifyErrorResponseSchema'
import { responseInsert } from './dbInsertProduction'

const bodySchema = z.object({
  url: z.string().url(),
  user: z.string().email(),
})

type BodySchema = z.infer<typeof bodySchema>

export function fullProcess(app: FastifyZodTypedInstance) {
  app.post(
    '/fullProcess',
    {
      schema: {
        body: bodySchema,
        response: {
          200: responseInsert,
          400: fastifyErrorResponseSchema,
          500: fastifyErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { url, user } = request.body as BodySchema

      // Passo 1: Executar a lógica da zipFile manualmente
      const zipFileResult = await app.inject({
        method: 'POST',
        url: '/zipFile',
        payload: { url, user },
      })

      if (zipFileResult.statusCode !== 200) {
        return reply.status(zipFileResult.statusCode).send(zipFileResult.json())
      }

      const zipData = zipFileResult.json()

      // Passo 2: Truncar as tabelas
      const truncateResult = await app.inject({
        method: 'GET',
        url: '/truncateInfo',
      })

      if (truncateResult.statusCode !== 200) {
        return reply
          .status(truncateResult.statusCode)
          .send(truncateResult.json())
      }

      const truncateData = truncateResult.json()

      // Passo 3: Inserir os dados no banco
      const insertResult = await app.inject({
        method: 'POST',
        url: '/dbInsertProduction',
        payload: {
          uuid: zipData.uuid,
          racionalizados_time_in_ms: zipData.racionalizados_time_in_ms,
          comunizados_time_in_ms: zipData.comunizados_time_in_ms,
          troca_codigo_time_in_ms: zipData.troca_codigo_time_in_ms,
          versoes_time_in_ms: zipData.versoes_time_in_ms,
          cross_references_time_in_ms: zipData.cross_references_time_in_ms,
          produtos_time_in_ms: zipData.produtos_time_in_ms,
          deleted_racionalizados: truncateData.deleted_racionalizados,
          deleted_comunizados: truncateData.deleted_comunizados,
          deleted_troca_codigo: truncateData.deleted_troca_codigo,
          deleted_versoes: truncateData.deleted_versoes,
          deleted_cross_references: truncateData.deleted_cross_references,
          deleted_produtos: truncateData.deleted_produtos,
        },
      })

      return reply.status(insertResult.statusCode).send(insertResult.json())
    },
  )
}
