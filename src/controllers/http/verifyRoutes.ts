import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import {
  getActiveRoutes,
  getProgress,
  getUserUpdate,
  isAnyRouteActive,
  progressType,
  routesNames,
} from '@/utils/routeStage'
import { z } from 'zod'

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
      })
    },
  )
}
