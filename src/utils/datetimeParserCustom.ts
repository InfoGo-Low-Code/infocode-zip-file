import { ptBR } from 'date-fns/locale/pt-BR'
import { formatInTimeZone } from 'date-fns-tz'

export function datetimeParserCustom(date: Date) {
  const formattedDate = formatInTimeZone(
    date,
    'America/Sao_Paulo',
    'dd/MM/yyyy HH:mm:ss',
    {
      locale: ptBR,
    },
  )

  return formattedDate
}
