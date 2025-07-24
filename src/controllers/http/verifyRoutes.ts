import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import {
  getActiveRoutes,
  isAnyRouteActive,
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
          }),
        },
      },
    },
    async (_, reply) => {
      return reply.send({
        inUse: isAnyRouteActive(),
        activeRoutes: getActiveRoutes(),
      })
    },
  )
}
