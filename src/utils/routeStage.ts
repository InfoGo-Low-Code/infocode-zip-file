import { z } from 'zod'

export const routesNames = z.enum(['zipFile', 'truncateInfo', 'dbInsert'])

type RoutesNames = z.infer<typeof routesNames>

export const progressType = z.object({
  percentage: z.number(),
  message: z.string(),
})

type Progress = z.infer<typeof progressType>

const activeRoutes = new Set<RoutesNames>()

let progress: Progress = { message: 'Processo em Repouso', percentage: 0 }

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

export function updateProgress(newProgress: Progress) {
  progress = newProgress
}

export function getProgress(): Progress {
  return progress
}
