import { formatDate } from 'date-fns'

export function datetimeParserCustom(date: Date) {
  const formattedDate = formatDate(date, 'dd/MM/yyyy HH:mm')

  return formattedDate
}
