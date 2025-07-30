import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import {
  getActiveRoutes,
  getProgress,
  getUpdateInfo,
  getUserUpdate,
  isAnyRouteActive,
  progressType,
  routesNames,
} from '@/utils/routeStage'
import { z } from 'zod'
import { responseInsert } from './dbInsertProduction'

export function verifyRoutes(app: FastifyZodTypedInstance) {
  app.get(
    '/verifyRoutes',
    {
      schema: {
        response: {
          200: z.object({
            inUse: z.boolean(),
            activeRoutes: z.array(routesNames),
            progress: progressType,
            user: z.string(),
            updateInfo: responseInsert,
          }),
        },
      },
    },
    async (_, reply) => {
      return reply.send({
        inUse: isAnyRouteActive(),
        activeRoutes: getActiveRoutes(),
        progress: getProgress(),
        user: getUserUpdate(),
        updateInfo: getUpdateInfo(),
      })
    },
  )
}
