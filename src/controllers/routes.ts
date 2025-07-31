import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { dbInsert } from './http/dbInsert'
import { zipFile } from './http/zipFile'
import { truncateInfo } from './http/truncateInfo'
import { verifyRoutes } from './http/verifyRoutes'
import { dbInsertProduction } from './http/dbInsertProduction'
import { clearInfoData } from './http/clearInfoData'
import { fullProcess } from './http/fullProcess'

export function routes(app: FastifyZodTypedInstance) {
  app.register(zipFile)
  app.register(truncateInfo)
  app.register(dbInsert)
  app.register(verifyRoutes)
  app.register(dbInsertProduction)
  app.register(clearInfoData)
  app.register(fullProcess)
}
