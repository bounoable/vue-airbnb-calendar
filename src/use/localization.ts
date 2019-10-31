import { Ref } from '@vue/composition-api'
import { Locale, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'

export interface Options {
  /**
   * The date-fns locale to use. Defauls to english.
   */
  dateFnsLocale: Locale

  /**
   * The number of character used for the shortened weekdays.
   */
  shortWeekdaysLength: number
}

const now = new Date()

export default function useLocalization(locale: Ref<Locale>, options: Ref<Options>) {
  const weekdayNames = eachDayOfInterval({
      start: startOfWeek(now),
      end: endOfWeek(now),
    }).map(d => locale.value.localize.day(d.getDay()) as string)

  const weekdaysShort = weekdayNames.map(name => name.substr(0, options.value.shortWeekdaysLength))

  return {
    locale,
    weekdayNames,
    weekdaysShort,
  }
}