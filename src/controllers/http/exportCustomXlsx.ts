import { FastifyZodTypedInstance } from '@/@types/fastifyZodTypedInstance'
import { createExcelComunizados } from '@/utils/createExcel/createExcelComunizados'
import { createExcelRacionalizados } from '@/utils/createExcel/createExcelRacionalizados'
import { createExcelTrocaCodigo } from '@/utils/createExcel/createExcelTrocaCodigo'
import { createExcelVersoes } from '@/utils/createExcel/createExcelVersoes'
import { runQuery, Tables, tables } from '@/utils/customQuery'
import { z } from 'zod'

export function exportCustomXlsx(app: FastifyZodTypedInstance) {
  app.post(
    '/cofap/customXlsx',
    {
      schema: {
        body: z.object({
          registros: z.string(),
          tabela: tables,
        }),
      },
    },
    async (request, reply) => {
      const { registros, tabela } = request.body

      const registrosArray =
        tabela === 'VERSÕES'
          ? registros.replace(/;/g, "'',''")
          : registros.replace(/;/g, "','")

      const query = customQueryByTable(tabela, registrosArray)

      const data = await runQuery<Tables>(query)

      let buffer: Buffer

      if (tabela === 'RACIONALIZADOS') {
        buffer = await createExcelRacionalizados(data)
      } else if (tabela === 'MUDANÇA DE CÓDIGOS') {
        buffer = await createExcelTrocaCodigo(data)
      } else if (tabela === 'VERSÕES') {
        buffer = await createExcelVersoes(data)
      } else {
        buffer = await createExcelComunizados(data)
      }

      reply
        .header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        .header('Content-Disposition', `attachment; filename=${tabela}.xlsx`)
        .send(buffer)
    },
  )
}

function customQueryByTable(table: Tables, registros: string): string {
  if (table === 'RACIONALIZADOS') {
    return `
      SELECT
            CONCAT(p.Marca, '-', p.Linha, '-', p.Produto, '-', p.[Posição]) AS ID,
            p.Marca AS [MARCA],
            p.Linha [LINHA],
            p.Produto AS [CÓDIGO (DE)],
            '-' AS [CÓDIGO (PARA)],
            'RACIONALIZADO' AS [DESCRIÇÃO],
            p.[Posição] AS [POSIÇÃO]
        FROM dbo.RACIONALIZADOS r
        INNER JOIN dbo.PRODUTOS p
            ON r.Produto = p.Produto
        WHERE CONCAT(p.Marca, '-', p.Linha, '-', p.Produto, '-', p.[Posição]) IN ('${registros}')
        GROUP BY p.Marca, p.Linha, p.Produto, p.[Posição]
        ORDER BY p.Produto;
    `
  } else if (table === 'MUDANÇA DE CÓDIGOS') {
    return `
      SELECT
            CONCAT(p.Marca, '-', p.Linha, '-', p.Produto, '-', tc.CodigoProdutoSimilar, '-', tc.Descricao, '-', p.[Posição]) AS ID,
            p.Marca AS MARCA,
            p.Linha AS LINHA,
            p.Produto AS [CÓDIGO (DE)],
            tc.CodigoProdutoSimilar AS [CÓDIGO (PARA)],
            tc.Descricao AS [DESCRIÇÃO],
            p.[Posição] AS [POSIÇÃO]
        FROM dbo.TROCA_CODIGO tc
        INNER JOIN dbo.PRODUTOS p
            ON tc.Produto = p.Produto
        WHERE CONCAT(p.Marca, '-', p.Linha, '-', p.Produto, '-', tc.CodigoProdutoSimilar, '-', tc.Descricao, '-', p.[Posição]) IN ('${registros}')
        GROUP BY
            p.Marca,
            p.Linha,
            p.Produto,
            tc.CodigoProdutoSimilar,
            tc.Descricao,
            p.[Posição]
        ORDER BY p.Produto;
    `
  } else if (table === 'VERSÕES') {
    return `
      DECLARE @cols NVARCHAR(MAX);
      DECLARE @colsISNULL NVARCHAR(MAX);
      DECLARE @query NVARCHAR(MAX);

      SELECT @cols = STUFF((
          SELECT ',' + QUOTENAME([DESCRIÇÃO])
          FROM (
              SELECT DISTINCT Descricao AS [DESCRIÇÃO],
                  CASE 
                      WHEN Descricao = 'SUPER' THEN 1
                      WHEN Descricao = 'TURBOGAS' THEN 2
                      WHEN Descricao = 'SPA SUPER' THEN 3
                      WHEN Descricao = 'SPA TURBOGAS' THEN 4
                      WHEN Descricao LIKE '%45%' THEN 5
                      WHEN Descricao LIKE '%35%' THEN 6
                      ELSE 7
                  END AS Ordem
              FROM VERSOES
          ) AS ordenado
          ORDER BY Ordem
          FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)')
      ,1,1,'');

      SELECT @colsISNULL = STUFF((
          SELECT ', ISNULL(' + QUOTENAME([DESCRIÇÃO]) + ', ''-'') AS ' + QUOTENAME([DESCRIÇÃO])
          FROM (
              SELECT DISTINCT Descricao AS [DESCRIÇÃO],
                  CASE
                      WHEN Descricao = 'SUPER' THEN 1
                      WHEN Descricao = 'TURBOGAS' THEN 2
                      WHEN Descricao = 'SPA SUPER' THEN 3
                      WHEN Descricao = 'SPA TURBOGAS' THEN 4
                      WHEN Descricao LIKE '%45%' THEN 5
                      WHEN Descricao LIKE '%35%' THEN 6
                      WHEN Descricao = 'AÇO' THEN 7
                      WHEN Descricao = 'NYLON' THEN 8
                      ELSE 9
                  END AS Ordem
              FROM VERSOES
          ) AS ordenado
          ORDER BY Ordem
          FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)')
      ,1,1,'');

      SET @query = '
      WITH Deduplicado AS (
          SELECT
              CONCAT(p.Marca, ''-'', p.Linha, ''-'', p.Produto, ''-'', p.[Posição], ''-'', v.Descricao, ''-'', v.CodigoProdutoSimilar) AS ID,
              p.Marca AS MARCA,
              p.Linha AS LINHA,
              p.Produto AS PRODUTO,
              p.Posição AS POSIÇÃO,
              v.Descricao AS [DESCRIÇÃO],
              v.CodigoProdutoSimilar
          FROM PRODUTOS p
          INNER JOIN VERSOES v
              ON p.Produto = v.Produto OR p.Produto = v.CodigoProdutoSimilar
          WHERE CONCAT(p.Marca, ''-'', p.Linha, ''-'', p.Produto, ''-'', p.[Posição], ''-'', v.Descricao, ''-'', v.CodigoProdutoSimilar) IN (''${registros}'')
      ),
      Pivotado AS (
          SELECT
              ID,
              MARCA,
              LINHA,
              ' + @colsISNULL + ',
              Posição
          FROM Deduplicado
          PIVOT (
              MAX(CodigoProdutoSimilar)
              FOR [DESCRIÇÃO] IN (' + @cols + ')
          ) AS pvt
      ),
      Numerado AS (
          SELECT *,
              ROW_NUMBER() OVER (
                  PARTITION BY Marca, Linha, [SUPER], [TURBOGAS], [SPA SUPER], [SPA TURBOGAS],
                              [SUPER DE 45MM], [SUPER DE 35 MM EXPANDIDO], [AÇO], [NYLON], Posição
                  ORDER BY Marca
              ) AS rn
          FROM Pivotado
      )
      SELECT ID, MARCA, LINHA, POSIÇÃO, ' + @cols + '
      FROM Numerado
      WHERE rn = 1;
      ';

      EXEC sp_executesql @query;
    `
  } else {
    return `
      SELECT
          CONCAT(Marca, '-', Linha, '-', Segmento, '-', Produto_Comunizado, '-', Produto_Comunizou, '-', Posição, '-', Obs) AS ID,
          Marca AS MARCA,
          Linha AS LINHA,
          Segmento AS SEGMENTO,
          Produto_Comunizado AS [PRODUTO COMUNINZADO],
          Produto_Comunizou AS [PRODUTO QUE O COMUNIZOU],
          Posição AS [POSIÇÃO],
          Obs AS [OBS]
      FROM RELATORIO_COMUNIZADOS
      WHERE CONCAT(Marca, '-', Linha, '-', Segmento, '-', Produto_Comunizado, '-', Produto_Comunizou, '-', Posição, '-', Obs) IN ('${registros}')
    `
  }
}
