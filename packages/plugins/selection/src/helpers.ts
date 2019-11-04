import { startOfDay, areIntervalsOverlapping, isBefore, isWithinInterval } from 'date-fns'
import { Interval } from './options'
import { CalendarItem } from 'vue-airbnb-calendar/dist/use/calendar-items'

export const normalizeRanges = (ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return []
  }
  
  return (ranges instanceof Function ? ranges() : ranges).map((r): Interval => ({
    start: startOfDay(r.start),
    end: startOfDay(r.end),
  }))
}

export const intervalOverlapsWith = (interval: Interval, ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return
  }

  ranges = normalizeRanges(ranges)
  if (!(ranges.length && interval.start && interval.end)) {
    return false
  }

  const selectionInterval = orderedInterval(interval.start, interval.end)

  for (const range of ranges) {
    if (areIntervalsOverlapping(selectionInterval, range)) {
      return true
    }
  }

  return false
}

export const orderedInterval = (date1: Date, date2: Date): Interval => {
  const start = isBefore(date1, date2) ? date1 : date2
  const end = date1 === start ? date2 : date1

  return { start, end }
}

export const findRangesOfItem = (item: CalendarItem, ranges?: Interval[]|(() => Interval[])) => {
  return findRangesOfDate(item.date, ranges)
}

export const findRangesOfDate = (date: Date, ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return []
  }

  ranges = normalizeRanges(ranges)
  return ranges.filter(range => isWithinInterval(date, range))
}
