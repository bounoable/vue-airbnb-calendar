import { computed, Ref } from '@vue/composition-api'
import { Calendar } from './calendar'
import { endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns'

export interface CalendarItem {
  date: Date
  isCurrentMonth: boolean
}

export interface CalendarRow {
  items: CalendarItem[]
}

export default function useCalendarItems(calendar: Ref<Calendar>) {
  const firstOfMonth = computed(() => {
    return new Date(calendar.value.year, calendar.value.month, 1, 0, 0, 0, 0)
  })

  const lastOfMonth = computed(() => {
    return endOfMonth(firstOfMonth.value as Date)
  })

  const currentMonthDates = computed(() => {
    return eachDayOfInterval({
      start: firstOfMonth.value as Date,
      end: lastOfMonth.value as Date,
    })
  })

  const prevMonthDates = computed(() => {
    return eachDayOfInterval({
      start: subMonths(firstOfMonth.value as Date, 1),
      end: new Date(firstOfMonth.value.getFullYear(), firstOfMonth.value.getMonth(), 0),
    })
  })

  const nextMonthDates = computed(() => {
    return eachDayOfInterval({
      start: addMonths(firstOfMonth.value as Date, 1),
      end: addMonths(lastOfMonth.value as Date, 1),
    })
  })

  const calendarItems = computed(() => {
    const items: CalendarItem[] = []
    const firstOfMonthDay = firstOfMonth.value.getDay()

    for (let i = 0; i < firstOfMonthDay; ++i) {
      const date = prevMonthDates.value[prevMonthDates.value.length - (firstOfMonthDay - i)]

      items.push({
        date,
        isCurrentMonth: false,
      })
    }

    for (const date of currentMonthDates.value) {
      items.push({
        date,
        isCurrentMonth: true,
      })
    }

    let remaining = 7 - (items.length % 7)

    for (let i = 0; i < remaining; ++i) {
      const date = nextMonthDates.value[i]
      items.push({
        date,
        isCurrentMonth: false,
      })
    }

    return items
  })

  const calendarRows = computed(() => {
    const count = Math.ceil(calendarItems.value.length / 7)
    const rows: CalendarRow[] = []

    for (let i = 0; i < count; ++i) {
      const items: CalendarItem[] = []
      for (let c = i * 7; c < ((i + 1) * 7); ++c) {
        items.push(calendarItems.value[c])
      }
      rows.push({
        items,
      })
    }

    return rows
  })

  return {
    firstOfMonth,
    lastOfMonth,
    currentMonthDates,
    prevMonthDates,
    nextMonthDates,
    calendarItems,
    calendarRows,
  }
}
