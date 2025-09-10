import { Workbook } from 'exceljs'
import { QueryResultMap, WithoutID } from '../customQuery'

export async function createExcelRacionalizados<K extends keyof QueryResultMap>(
  data: WithoutID<QueryResultMap[K]>[],
) {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('RACIONALIZADOS')

  // ===== Colunas =====
  worksheet.columns = Object.keys(data[0]).map((key, idx) => ({
    header: key,
    key: key,
    width:
      idx === 0 || (idx !== 1 && idx !== Object.keys(data[0]).length - 1)
        ? 20
        : 25.8,
  }))

  // ===== Linha 1 - Título =====
  worksheet.mergeCells('A1:F1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = `RELATÓRIO DE PRODUTOS RACIONALIZADOS`
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  titleCell.font = { name: 'Arial Nova', size: 10.5, bold: true }
  worksheet.getRow(1).height = 45 * 0.7609 // Aqui é o valor em Pixel * 0.7609 pois esse valor seria em altura Excel e não em pixel

  const headerRow = worksheet.getRow(2)
  headerRow.values = Object.keys(data[0]).map((key) => key)
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' }
  headerRow.eachCell((cell, idx) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor:
        idx === 3
          ? { argb: 'C00000' }
          : idx === 4
            ? { argb: 'B5E6A2' }
            : { argb: 'FFFFFF' },
    }
    cell.font = {
      name: 'Arial Nova',
      bold: true,
      size: 8,
      color: idx === 3 ? { argb: 'FFFFFF' } : { argb: '000000' },
    }
  })

  // ===== Dados a partir da linha 3 =====
  worksheet.addRows(data)

  // ===== Estilo das células de dados =====
  worksheet.getRows(3, worksheet.rowCount - 2)?.forEach((row) => {
    row.eachCell((cell, idx) => {
      cell.alignment = {
        wrapText: true,
        horizontal: 'left',
        vertical: 'middle',
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor:
          idx === 3
            ? { argb: 'FFF3F3' }
            : idx === 4
              ? { argb: 'F5FCF2' }
              : { argb: 'FFFFFF' },
      }
      cell.font = {
        name: 'Arial Nova',
        size: 8,
      }
    })
  })

  // ===== Bordas globais =====
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = {
        left: {
          style: 'thin',
          color: { argb: rowNumber <= 2 ? '000000' : 'D9D9D9' },
        },
        top: {
          style: 'thin',
          color: { argb: rowNumber <= 2 ? '000000' : 'D9D9D9' },
        },
        right: {
          style: 'thin',
          color: {
            argb: colNumber === row.cellCount ? '000000' : 'D9D9D9',
          },
        },
        bottom: {
          style: 'thin',
          color: {
            argb:
              rowNumber === 1
                ? 'FFFFFF'
                : rowNumber === 2 || rowNumber === worksheet.rowCount
                  ? '000000'
                  : 'D9D9D9',
          },
        },
      }
    })
  })

  // Linha 1 com filtros na coluna
  worksheet.autoFilter = {
    from: {
      row: 2,
      column: 1,
    },
    to: {
      row: 2,
      column: worksheet.columns.length,
    },
  }

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 2,
      xSplit: 6,
    },
  ]

  const logoInfoCode = workbook.addImage({
    filename: './src/images/logo-infocode.png',
    extension: 'png',
  })

  const logoCofapMarelli = workbook.addImage({
    filename: './src/images/logo-cofap-marelli.jpg',
    extension: 'jpeg',
  })

  worksheet.addImage(logoInfoCode, {
    tl: { col: 0.15, row: 0.15 },
    ext: { width: 123.59, height: 35 },
  })

  worksheet.addImage(logoCofapMarelli, {
    tl: { col: worksheet.columnCount - 1, row: 0 },
    ext: { width: 180.6, height: 45 },
  })

  // ===== Gerar Buffer =====
  const buffer = await workbook.xlsx.writeBuffer()

  return Buffer.from(buffer)
}
