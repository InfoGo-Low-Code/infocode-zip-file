import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import {
  setUpdateInfo,
  setUserFinished,
  setUserUpdate,
  updateProgress,
} from '@/utils/routeStage'
import { z } from 'zod'

export function clearInfoData(app: FastifyZodTypedInstance) {
  app.get(
    '/clearInfoData',
    {
      schema: {
        response: {
          200: z.object({
            message: z.literal('Dados apagados'),
          }),
        },
      },
    },
    async (_, reply) => {
      setUserUpdate('')
      setUserFinished('')
      setUpdateInfo({
        message: '',
        inserted_racionalizados: 0,
        racionalizados_time_in_ms: 0,
        inserted_comunizados: 0,
        comunizados_time_in_ms: 0,
        inserted_troca_codigo: 0,
        troca_codigo_time_in_ms: 0,
        inserted_versoes: 0,
        versoes_time_in_ms: 0,
        inserted_cross_references: 0,
        cross_references_time_in_ms: 0,
        inserted_produtos: 0,
        produtos_time_in_ms: 0,
        end_date_time_racionalizados: '',
        end_date_time_comunizados: '',
        end_date_time_troca_codigo: '',
        end_date_time_versoes: '',
        end_date_time_cross_references: '',
        end_date_time_produtos: '',
        deleted_racionalizados: 0,
        deleted_comunizados: 0,
        deleted_troca_codigo: 0,
        deleted_versoes: 0,
        deleted_cross_references: 0,
        deleted_produtos: 0,
      })
      updateProgress({ message: '', percentage: 0 })

      return reply.send({
        message: 'Dados apagados',
      })
    },
  )
}
