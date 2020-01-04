import Options, { DateFormat, Selection, Interval } from './options'
import { CalendarItem } from 'vue-airbnb-calendar/types/use/calendar-items'
import { intervalOverlapsWith, orderedInterval } from './helpers'
import { subDays, addDays, isBefore, differenceInDays, isAfter } from 'date-fns'
import { Analysis, getInfo } from './analysis'

export const hasReservation = (item: CalendarItem, analysis: Analysis) => {
  return !!(analysis && analysis[item.date.getTime()] && analysis[item.date.getTime()].reservation)
}

export const validateCheckInOut = <F extends DateFormat>(
  selection: Selection,
  item: CalendarItem,
  analysis: Analysis,
  reservationRanges: Interval[],
  selectableWeekday: boolean,
  minDays: number,
  options: Options<F>
) => {
  const resOptions = options.reservations

  if (!resOptions) {
    return true
  }

  if (!minDays) {
    return true
  }

  const maxGap = resOptions.maxGap
    ? (resOptions.maxGap instanceof Function
      ? resOptions.maxGap({ selection })
      : resOptions.maxGap
    )
    : 0

  // validate selection start
  if (!(selection.from || selection.to) || (selection.from && selection.to)) {
    // shift dates depending on whether check-in & check-out days can overlap
    const shift = resOptions.allowCheckInOutOverlap ? 0 : 1

    const isCheckIn = getInfo(addDays(item.date, shift), analysis).checkIn
    const isCheckOut = getInfo(subDays(item.date, shift), analysis).checkOut

    // always allow check-in and check-out days to be selected if resOptions.allowGapFills is true
    if (
      resOptions.allowGapFills &&
      isCheckOut != isCheckIn
    ) {
      return true
    }

    if (
      isCheckOut &&
      !intervalOverlapsWith({
        start: item.date,
        end: addDays(item.date, minDays),
      }, reservationRanges)
    ) {
      return true
    }

    if (
      isCheckIn &&
      !intervalOverlapsWith({
        start: subDays(item.date, minDays),
        end: item.date,
      }, reservationRanges)
    ) {
      return true
    }

    if (!selectableWeekday) {
      return false
    }

    // allow check-in with a maximum gap to another reservation of maxGap
    for (const range of reservationRanges) {
      if (isBefore(item.date, range.start)) {
        // check if item.date is in the gap zone before a reservation and minDays is would be fulfilled
        if (
          differenceInDays(range.start, item.date) <= (maxGap + shift) &&
          !intervalOverlapsWith({
            start: subDays(item.date, minDays),
            end: item.date,
          }, reservationRanges)
        ) {
          return true
        }
      } else if (isAfter(item.date, range.end)) {
        // check if item.date is in the gap zone after a reservation and minDays is would be fulfilled
        if (
          differenceInDays(item.date, range.end) <= (maxGap + shift) &&
          !intervalOverlapsWith({
            start: item.date,
            end: addDays(item.date, minDays),
          }, reservationRanges)
        ) {
          return true
        }
      }
    }

    // check if minDays would be fulfilled
    if (
      intervalOverlapsWith({ start: subDays(item.date, minDays + shift), end: item.date }, reservationRanges) ||
      intervalOverlapsWith({ start: item.date, end: addDays(item.date, minDays + shift) }, reservationRanges)
    ) {
      return false
    }
  }
  
  // validate selection end
  if (selection.from && !selection.to) {
    // shift dates depending on whether check-in & check-out days can overlap
    let shift = resOptions.allowCheckInOutOverlap ? 0 : 1
    const interval = orderedInterval(selection.from.date, item.date)
    const days = differenceInDays(interval.end, interval.start)

    // check if selection would wrap a reservation
    if (intervalOverlapsWith(interval, reservationRanges)) {
      return false
    }

    // allow gap fills
    if (days < minDays && resOptions.allowGapFills) {
      if (
        isAfter(item.date, selection.from.date) &&
        getInfo(addDays(item.date, shift), analysis).checkIn &&
        getInfo(subDays(selection.from.date, shift), analysis).checkOut
      ) {
        return true
      } else if (
        isBefore(item.date, selection.from.date) &&
        getInfo(subDays(item.date, shift), analysis).checkOut &&
        getInfo(addDays(selection.from.date, shift), analysis).checkIn
      ) {
        return true
      }
    }

    const dateInfo = getInfo(item.date, analysis)

    if (!selection.from) {
      if (dateInfo.checkOut) {
        return true
      }
    }

    if (days < minDays) {
      return false
    }

    // always allow seletion to connect to check-in & check-out days
    if (dateInfo.checkIn != dateInfo.checkOut) {
      return true
    }

    if (!selectableWeekday) {
      return false
    }
    
    for (const range of reservationRanges) {
      // check if item.date is in the gap zone before or after a reservation and minDays is would be fulfilled
      if (
        (isBefore(item.date, range.start) && differenceInDays(range.start, item.date) <= (maxGap + shift)) ||
        (isAfter(item.date, range.end) && differenceInDays(item.date, range.end) <= (maxGap + shift))
      ) {
        return true
      }
    }

    shift = (resOptions.allowCheckInOutOverlap ? 0 : 2)

    if (isBefore(item.date, selection.from.date)) {
      if (intervalOverlapsWith({
        start: subDays(interval.start, minDays + shift),
        end: interval.start,
      }, reservationRanges)) {
        return false
      }
    }

    if (isAfter(item.date, selection.from.date)) {
      if (intervalOverlapsWith({
        start: interval.end,
        end: addDays(interval.end, minDays + shift),
      }, reservationRanges)) {
        return false
      }
    }
  }

  return true
}
