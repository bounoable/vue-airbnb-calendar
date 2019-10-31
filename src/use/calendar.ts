import { ref, computed, Ref, watch } from '@vue/composition-api'
import { InternalOptions } from '../options'
import { subMonths } from 'date-fns'
import { debounce } from 'lodash'
import ResizeObserverPonyfill from 'resize-observer-polyfill'

export interface Calendar {
  year: number
  month: number
}

export default function useCalendar(picker: Ref<HTMLElement|null>, options: Ref<InternalOptions>) {
  const pickerWidth = ref(0)

  const roHandler = debounce((entries: any) => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement
      pickerWidth.value = target.clientWidth
    }
  }, 250, { leading: false })

  const ResizeObserver = (
    typeof window !== 'undefined'
      ? ((window as any).ResizeObserver || ResizeObserverPonyfill)
      : ResizeObserverPonyfill
  ) as typeof ResizeObserverPonyfill

  const ro = new ResizeObserver(roHandler)

  watch(picker, (picker, oldPicker) => {
    if (!oldPicker && picker) {
      ro.observe(picker)
    }
  })

  const now = new Date()

  const startCalendar = ref<Calendar>({
    year: (options.value.startMonth || now).getFullYear(),
    month: (options.value.startMonth || now).getMonth(),
  })
  
  const maxVisibleCalendars = computed(() => {
    const calendars = [startCalendar.value]

    for (let i = 1; i < options.value.maxMonths; ++i) {
      const calendar = shiftCalendar(startCalendar.value, 0, i)

      if (options.value.lastMonth && (
          calendar.year > options.value.lastMonth.getFullYear() || (
            calendar.year >= options.value.lastMonth.getFullYear() &&
            calendar.month > options.value.lastMonth.getMonth()
        )
      )) {
        continue
      }

      calendars[i] = calendar
    }

    return calendars
  })

  const visibleCalendars = computed(() => {
    let count = maxVisibleCalendars.value.length

    count = 1 + Math.round((pickerWidth.value - 300) / (350))
    count = count <= 0 ? 1 : count
    count = count > maxVisibleCalendars.value.length ? maxVisibleCalendars.value.length : count

    return maxVisibleCalendars.value.slice(0, count)
  })

  const endCalendar = computed(() => visibleCalendars.value[visibleCalendars.value.length - 1])

  const renderedCalendars = computed(() => {
    const calendars = visibleCalendars.value.slice()

    if (!calendars.length) {
      return calendars
    }

    calendars.unshift(shiftCalendar(calendars[0], 0, -1))
    calendars.push(shiftCalendar(calendars[calendars.length - 1], 0, 1))

    return calendars
  })

  const moduloFix = (num: number, max = 12) => (num % max + max) % max

  const shiftCalendar = (calendar: Calendar, years: number, months: number) => {
    calendar = {
      year: calendar.year,
      month: calendar.month,
    }

    let year = calendar.year + years
    const month = calendar.month + months

    if (month < 0) {
      year--
    } else if (month > 11) {
      year++
    }

    calendar.year = year
    calendar.month = moduloFix(month)

    return calendar
  }

  const reachedMin = computed(() => {
    if (!options.value.firstMonth) {
      return false
    }

    const prevCalendar = shiftCalendar(startCalendar.value, 0, -1)
    return isBeforeFirstMonth(prevCalendar.year, prevCalendar.month)
  })

  const reachedMax = computed(() => {
    if (!options.value.lastMonth) {
      return false
    }

    const nextCalendar = shiftCalendar(visibleCalendars.value[visibleCalendars.value.length - 1], 0, 1)
    return isAfterLastMonth(nextCalendar.year, nextCalendar.month)
  })

  const isBeforeFirstMonth = (year: number, month:number) => {
    if (!options.value.firstMonth) {
      return false
    }

    return year < options.value.firstMonth.getFullYear()
      || (year <= options.value.firstMonth.getFullYear() && month < options.value.firstMonth.getMonth())
  }

  const isAfterLastMonth = (year: number, month:number) => {
    if (!options.value.lastMonth) {
      return false
    }

    return year > options.value.lastMonth.getFullYear()
      || (year >= options.value.lastMonth.getFullYear() && month > options.value.lastMonth.getMonth())
  }

  const shiftStartCalendar = (years: number, months: number) => {
    const sumMonths = 12 * years + months
    const calendar = shiftCalendar(startCalendar.value, years, months)

    if (isBeforeFirstMonth(calendar.year, calendar.month) || isAfterLastMonth(calendar.year, calendar.month)) {
      return
    }

    if (sumMonths < 0 && reachedMin.value) {
      calendar.year = options.value.firstMonth!.getFullYear()
      calendar.month = options.value.firstMonth!.getMonth()
    }

    if (sumMonths > 0 && reachedMax.value) {
      const max = subMonths(options.value.lastMonth!, options.value.maxMonths - 1)
      calendar.year = max.getFullYear()
      calendar.month = max.getMonth()
    }

    startCalendar.value = calendar
  }

  return {
    pickerWidth,
    startCalendar,
    endCalendar,
    visibleCalendars,
    renderedCalendars,
    shiftCalendar,
    shiftStartCalendar,
    moduloFix,
    reachedMin,
    reachedMax
  }
}
