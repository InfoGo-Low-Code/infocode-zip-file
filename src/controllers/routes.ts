import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { dbInsert } from './http/dbInsert'
import { zipFile } from './http/zipFile'
import { truncateInfo } from './http/truncateInfo'

export function routes(app: FastifyZodTypedInstance) {
  app.register(zipFile)
  app.register(truncateInfo)
  app.register(dbInsert)
}
