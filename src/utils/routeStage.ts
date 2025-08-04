import { ResponseInsert } from '@/controllers/http/dbInsertProduction'
import { z } from 'zod'

export const routesNames = z.enum(['zipFile', 'truncateInfo', 'dbInsert'])

type RoutesNames = z.infer<typeof routesNames>

export const progressType = z.object({
  percentage: z.number(),
  message: z.string(),
})

type Progress = z.infer<typeof progressType>

let user = ''
let userFinished = ''

const activeRoutes = new Set<RoutesNames>()

let progress: Progress = { message: 'Processo em Repouso', percentage: 0 }

let responseInsert: ResponseInsert = {
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
}

export function setUserFinished(userEmail: string) {
  userFinished = userEmail
}

export function getUserFinished(): string {
  return userFinished
}

export function setUserUpdate(userEmail: string) {
  user = userEmail
}

export function getUserUpdate(): string {
  return user
}

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

export function setUpdateInfo(response: ResponseInsert) {
  responseInsert = response
}

export function getUpdateInfo(): ResponseInsert {
  return responseInsert
}
