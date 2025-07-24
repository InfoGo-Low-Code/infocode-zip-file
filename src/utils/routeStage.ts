import { z } from 'zod'

export const routesNames = z.enum(['zipFile', 'truncateInfo', 'dbInsert'])

type RoutesNames = z.infer<typeof routesNames>

const activeRoutes = new Set<RoutesNames>()

export function startRoute(routeName: RoutesNames) {
  activeRoutes.add(routeName)
}

export function endRoute(routeName: RoutesNames) {
  activeRoutes.delete(routeName)
}

export function isAnyRouteActive(): boolean {
  return activeRoutes.size > 0
}

export function getActiveRoutes(): RoutesNames[] {
  return Array.from(activeRoutes)
}
