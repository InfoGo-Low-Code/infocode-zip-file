import { z, ZodError, ZodIssueCode } from 'zod'
import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { fastifyErrorResponseSchema } from '@/schemas/errors/fastifyErrorResponseSchema'

import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'

import { basename } from 'node:path'

import AdmZip from 'adm-zip'
import { parserCrossReferences } from '@/utils/parserCrossReferences'
import {
  parserRacionalizados,
  racionalizadosResponseSchema,
  RacionalizadosResponseSchema,
} from '@/utils/parserRacionalizados'
import {
  parserProdutos,
  produtoResponseSchema,
  ProdutoResponseSchema,
} from '@/utils/parserProduto'
import {
  parserProdutoSimilar,
  produtoSimilarResponseSchema,
  ProdutoSimilarResponseSchema,
} from '@/utils//parserCodigoSimilar'
import {
  crossReferencesSchema,
  CrossReferencesSchema,
} from '@/schemas/crossReferencesSchema'
import { randomUUID } from 'node:crypto'

import { differenceInMilliseconds } from 'date-fns'
import {
  endRoute,
  getProgress,
  startRoute,
  updateProgress,
} from '@/utils/routeStage'
import { racionalizadosValidation } from '@/schemas/validation/racionalizadosValidation'
import { comunizadosValidation } from '@/schemas/validation/comunizadosValidation'
import { produtoSimilarValidation } from '@/schemas/validation/produtoSimilarValidation'
import { crossReferencesValidation } from '@/schemas/validation/crossReferencesValidation'
import { produtosValidation } from '@/schemas/validation/produtosValidation'

const jsonData = z.object({
  racionalizados: z.array(racionalizadosResponseSchema),
  comunizados: z.array(produtoSimilarResponseSchema),
  troca_codigo: z.array(produtoSimilarResponseSchema),
  versoes: z.array(produtoSimilarResponseSchema),
  cross_references: z.array(crossReferencesSchema),
  produtos: z.array(produtoResponseSchema),
})

export function zipFile(app: FastifyZodTypedInstance) {
  app.post(
    '/zipFile',
    {
      schema: {
        body: z.object({
          url: z.string().url(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            uuid: z.string(),
            racionalizados_time_in_ms: z.number(),
            comunizados_time_in_ms: z.number(),
            troca_codigo_time_in_ms: z.number(),
            versoes_time_in_ms: z.number(),
            cross_references_time_in_ms: z.number(),
            produtos_time_in_ms: z.number(),
          }),
          400: fastifyErrorResponseSchema,
          500: fastifyErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      startRoute('zipFile')
      updateProgress({ message: 'Processo Iniciado', percentage: 0 })

      const { url } = request.body

      if (!existsSync('./uploads')) {
        mkdirSync('./uploads', { recursive: true })
      }

      let index = 0
      let arquivo = ''

      try {
        const { data } = await app.axios.get(url, {
          responseType: 'arraybuffer',
        })

        const filename = basename(new URL(url).pathname)
        const filePath = `./uploads/${filename}`
        writeFileSync(filePath, data)

        updateProgress({
          message: 'Arquivo ZIP Inserido em Sistema',
          percentage: getProgress().percentage + 5,
        })

        const zip = new AdmZip(filePath)
        const zipEntries = zip.getEntries()

        const racionalizados: RacionalizadosResponseSchema[] = []
        const comunizados: ProdutoSimilarResponseSchema[] = []
        const troca_codigo: ProdutoSimilarResponseSchema[] = []
        const versoes: ProdutoSimilarResponseSchema[] = []
        const cross_references: CrossReferencesSchema[] = []
        const produtos: ProdutoResponseSchema[] = []

        let racionalizados_time_in_ms: number = 0
        let comunizados_time_in_ms: number = 0
        let troca_codigo_time_in_ms: number = 0
        let versoes_time_in_ms: number = 0
        let cross_references_time_in_ms: number = 0
        let produtos_time_in_ms: number = 0

        for (const entry of zipEntries) {
          const startTime = new Date()

          if (!entry.entryName.endsWith('.xlsx')) continue

          const filenameWithoutExt = basename(
            entry.entryName,
            '.xlsx',
          ).toUpperCase()

          const entryBuffer = entry.getData()
          const tempFilePath = `./uploads/${entry.entryName}`
          writeFileSync(tempFilePath, entryBuffer)

          if (filenameWithoutExt.includes('RAC')) {
            updateProgress({
              message: 'Lendo Arquivo de Racionalizados',
              percentage: getProgress().percentage + 5,
            })
            racionalizados.push(...parserRacionalizados(tempFilePath))
            racionalizados_time_in_ms = differenceInMilliseconds(
              new Date(),
              startTime,
            )
          } else if (filenameWithoutExt.includes('CROSS')) {
            updateProgress({
              message: 'Lendo Arquivo de Cross References',
              percentage: getProgress().percentage + 5,
            })
            cross_references.push(...parserCrossReferences(tempFilePath))
            cross_references_time_in_ms = differenceInMilliseconds(
              new Date(),
              startTime,
            )
          } else if (filenameWithoutExt.includes('PRODUTOS')) {
            updateProgress({
              message: 'Lendo Arquivo de Produtos',
              percentage: getProgress().percentage + 5,
            })
            produtos.push(...parserProdutos(tempFilePath))
            produtos_time_in_ms = differenceInMilliseconds(
              new Date(),
              startTime,
            )
          } else if (filenameWithoutExt.includes('COM')) {
            updateProgress({
              message: 'Lendo Arquivo de Comunizados',
              percentage: getProgress().percentage + 5,
            })
            comunizados.push(...parserProdutoSimilar(tempFilePath))
            comunizados_time_in_ms = differenceInMilliseconds(
              new Date(),
              startTime,
            )
          } else if (filenameWithoutExt.includes('TROCA')) {
            updateProgress({
              message: 'Lendo Arquivo de Troca de Códigos',
              percentage: getProgress().percentage + 5,
            })
            troca_codigo.push(...parserProdutoSimilar(tempFilePath))
            troca_codigo_time_in_ms = differenceInMilliseconds(
              new Date(),
              startTime,
            )
          } else if (filenameWithoutExt.includes('VERSOES')) {
            updateProgress({
              message: 'Lendo Arquivo de Versões',
              percentage: getProgress().percentage + 5,
            })
            versoes.push(...parserProdutoSimilar(tempFilePath))
            versoes_time_in_ms = differenceInMilliseconds(new Date(), startTime)
          }

          unlinkSync(tempFilePath)
        }

        unlinkSync(filePath)

        try {
          const path: string[] = []

          if (racionalizados.length < 1) {
            path.push('Racionalizados')
          }

          if (comunizados.length < 1) {
            path.push('Comunizados')
          }

          if (troca_codigo.length < 1) {
            path.push('Troca de Códigos')
          }

          if (versoes.length < 1) {
            path.push('Versões')
          }

          if (cross_references.length < 1) {
            path.push('Cross References')
          }

          if (produtos.length < 1) {
            path.push('Produtos')
          }

          if (path.length > 0) {
            throw new ZodError([
              {
                code: ZodIssueCode.invalid_type,
                expected: 'array',
                received: 'undefined',
                message: `Arquivos: ${path.join(', ')} não encontrado(s)`,
                path,
              },
            ])
          }
        } catch (error) {
          updateProgress({ message: 'Processo em Repouso', percentage: 0 })

          if (error instanceof ZodError) {
            const { errors } = error

            const arrayPath: string[] = []

            errors.forEach((error) => {
              if (error.path.length > 1) {
                arrayPath.push(error.path.join(', '))
              } else {
                arrayPath.push(error.path.toString())
              }
            })

            const path = arrayPath.join(', ')

            return reply.badRequest(
              `Erro ao fazer leitura de Arquivo. Faltando Arquivos: ${path}`,
            )
          }
        }

        try {
          racionalizados.forEach((racionalizado, idx) => {
            index = idx + 2
            arquivo = 'Racionalizados'

            racionalizadosValidation.parse(racionalizado)
          })

          comunizados.forEach((comunizado, idx) => {
            index = idx + 2
            arquivo = 'Comunizados'

            comunizadosValidation.parse(comunizado)
          })

          troca_codigo.forEach((troca, idx) => {
            index = idx + 2
            arquivo = 'Troca de Códigos'

            produtoSimilarValidation.parse(troca)
          })

          versoes.forEach((versao, idx) => {
            index = idx + 2
            arquivo = 'Versões'

            produtoSimilarValidation.parse(versao)
          })

          cross_references.forEach((cross, idx) => {
            index = idx + 2
            arquivo = 'Cross References'

            crossReferencesValidation.parse(cross)
          })

          produtos.forEach((produto, idx) => {
            index = idx + 2
            arquivo = 'Produtos'

            produtosValidation.parse(produto)
          })
        } catch (error) {
          if (error instanceof ZodError) {
            const { errors } = error

            throw new ZodError(errors)
          }
        }

        const jsonDataToParse = {
          racionalizados,
          comunizados,
          troca_codigo,
          versoes,
          cross_references,
          produtos,
        }

        const filenameJson = randomUUID()
        const jsonOutputPath = `./uploads/${filenameJson}.json`

        writeFileSync(
          jsonOutputPath,
          JSON.stringify(jsonDataToParse, null, 2),
          'utf-8',
        )

        const jsonContent = readFileSync(jsonOutputPath, 'utf-8')
        const json = JSON.parse(jsonContent)

        jsonData.parse(json)

        return reply.send({
          message: 'Arquivo processado',
          uuid: filenameJson,
          racionalizados_time_in_ms,
          comunizados_time_in_ms,
          troca_codigo_time_in_ms,
          versoes_time_in_ms,
          cross_references_time_in_ms,
          produtos_time_in_ms,
        })
      } catch (error) {
        updateProgress({ message: 'Processo em Repouso', percentage: 0 })

        if (error instanceof ZodError) {
          console.error(error)
          const { errors } = error

          return reply.badRequest(
            `Validação de campos falhou! Arquivo: ${arquivo}, Linha do Excel: ${index}, Erro: ${errors[0].message}`,
          )
        } else {
          return reply.internalServerError(String(error))
        }
      } finally {
        endRoute('zipFile')
      }
    },
  )
}
