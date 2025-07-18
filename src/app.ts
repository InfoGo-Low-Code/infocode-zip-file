import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifySensible } from '@fastify/sensible'
import { fastifyErrorHandler } from './plugins/fastifyErrorHandler'
import { fastifyCors } from './plugins/fastifyCors'
import fastifyAxios from 'fastify-axios'
import { routes } from './controllers/routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setErrorHandler(fastifyErrorHandler)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifySensible)
app.register(fastifyAxios)

app.register(routes)

fastifyCors(app)
