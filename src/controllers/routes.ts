import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { dbInsert } from './http/dbInsert'
import { zipFile } from './http/zipFile'

export function routes(app: FastifyZodTypedInstance) {
  app.register(dbInsert)
  app.register(zipFile)
}
