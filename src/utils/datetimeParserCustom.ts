import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

export function datetimeParserCustom(date: Date) {
  const formattedDate = formatDate(date, 'dd/MM/yyyy HH:mm', {
    locale: ptBR,
  })

  return formattedDate
}
