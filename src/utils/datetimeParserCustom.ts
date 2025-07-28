import { ptBR } from 'date-fns/locale/pt-BR'
import { formatInTimeZone } from 'date-fns-tz'

export function datetimeParserCustom(date: Date) {
  const formattedDate = formatInTimeZone(
    date,
    'America_Sao_Paulo',
    'dd/MM/yyyy HH:mm',
    {
      locale: ptBR,
    },
  )

  return formattedDate
}
