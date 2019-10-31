import { Ref, ref } from '@vue/composition-api'
import { CalendarItem } from '../../use/calendar-items'
import { isBefore, isAfter, isWithinInterval, areIntervalsOverlapping, differenceInDays, subDays, addDays, startOfDay, isSameDay } from 'date-fns'
import Dictionary from '../../dictionary'
import Options, { Selection, Interval, DateFormat } from './options'

export const selectItem = (item: CalendarItem, selection: Ref<Selection>) => {
  if (selection.value.from && selection.value.to) {
    selection.value = {
      from: item,
      to: null,
    }
    return
  }

  if (!selection.value.from) {
    selection.value.from = item
    return
  }

  let from = selection.value.from
  let to = item

  if (isBefore(to.date, from.date)) {
    to = from
    from = item
  }

  selection.value = { from, to }
}

export const clear = (selection: Ref<Selection>) => {
  selection.value.from = null
  selection.value.to = null
}

const containers: Dictionary<{
  selection: Ref<Selection>
  hoverItem: Ref<CalendarItem|null>
}> = {}

export const orderedInterval = (date1: Date, date2: Date): Interval => {
  const start = isBefore(date1, date2) ? date1 : date2
  const end = date1 === start ? date2 : date1

  return { start, end }
}

export const selectionWrapsRanges = (selection: Selection, ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return
  }
  
  if (!(selection.from && selection.to)) {
    return false
  }

  return intervalWrapsRanges({ start: selection.from.date, end: selection.to.date }, ranges)
}

export const intervalWrapsRanges = (interval: Interval, ranges?: Interval[]|(() => Interval[])) => {
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

const normalizeRanges = (ranges: Interval[]|(() => Interval[])) => {
  return (ranges instanceof Function ? ranges() : ranges).map((r): Interval => ({
    start: startOfDay(r.start),
    end: startOfDay(r.end),
  }))
}

const satisfiesMinDays = <F extends DateFormat>(
  selection: Selection,
  item: CalendarItem,
  options: Options<F>
) => {
  if (!options.minDays) {
    return true
  }

  const minDays = options.minDays instanceof Function ? options.minDays({ selection }) : options.minDays
  const blockedRanges = normalizeRanges(options.blockedRanges || [])
  const maxGapBlocked = options.maxGapBlocked
    ? (options.maxGapBlocked instanceof Function ? options.maxGapBlocked({ selection }) : options.maxGapBlocked)
    : 0

  if (!(selection.from || selection.to) || (selection.from && selection.to)) {
    for (const range of blockedRanges) {
      const shift = options.allowBlockedStartEndOverlap ? 0 : 1
      if (
        isSameDay(subDays(range.start, shift), item.date) ||
        isSameDay(addDays(range.end, shift), item.date)
      ) {
        return true
      }
    }

    const shift = (options.allowBlockedStartEndOverlap ? 0 : 1)
    const ranges: Interval[] = [
      { start: subDays(item.date, minDays + shift), end: item.date },
      { start: item.date, end: addDays(item.date, minDays + shift) }
    ]

    if (intervalWrapsRanges(ranges[0], blockedRanges) || intervalWrapsRanges(ranges[1], blockedRanges)) {
      return false
    }
  }
  
  if (selection.from && !selection.to) {
    const interval = orderedInterval(selection.from.date, item.date)

    const days = differenceInDays(interval.end, interval.start)

    for (const range of blockedRanges) {
      const shift = options.allowBlockedStartEndOverlap ? 0 : 1
      if (
        isSameDay(subDays(range.start, shift), item.date) ||
        isSameDay(addDays(range.end, shift), item.date)
      ) {
        return true
      }

      // if ((days >= minDays) && isSameDay(subDays(range.start, shift), item.date)) {
      //   if (differenceInDays(range.start, item.date) > maxGapBlocked) {
      //     return true
      //   }
      // }

      // if (maxGapBlocked && (days >= minDays) && (
      //   isSameDay(subDays(range.start, shift + maxGapBlocked), item.date) ||
      //   isSameDay(addDays(range.end, shift + maxGapBlocked), item.date)
      // )) {
        
      //   return true
      // }
    }

    if (days < minDays) {
      return false
    }

    const shift = (options.allowBlockedStartEndOverlap ? 0 : 2)

    if (isBefore(item.date, selection.from.date)) {
      const before: Interval = {
        start: subDays(interval.start, minDays + shift),
        end: interval.start,
      }
  
      if (intervalWrapsRanges(before, blockedRanges)) {
        return false
      }
    }

    if (isAfter(item.date, selection.from.date)) {
      const after: Interval = {
        start: interval.end,
        end: addDays(interval.end, minDays + shift),
      }

      if (intervalWrapsRanges(after, blockedRanges)) {
        return false
      }
    }
  }

  return true
}

const isBlocked = <F extends DateFormat>(item: CalendarItem, options: Options<F>) => {
  return !!findRangesOfItem(item, options.blockedRanges).length
}

const isBlockedForSelection = <F extends DateFormat>(item: CalendarItem, blockedRanges: Interval[], options: Options<F>) => {
  if (!blockedRanges.length) {
    return false
  }

  if (!options.allowBlockedStartEndOverlap) {
    return true
  }

  for (const range of blockedRanges) {
    if (isSameDay(item.date, range.start) || isSameDay(item.date, range.end)) {
      return false
    }
  }

  return true
}

const isBeforeMinDate = (item: CalendarItem, minDate?: Date) => {
  return !!minDate && isBefore(item.date, minDate)
}

const isAfterMaxDate = (item: CalendarItem, maxDate?: Date) => {
  return !!maxDate && isAfter(item.date, maxDate)
}

export const findRangesOfItem = (item: CalendarItem, ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return []
  }

  ranges = normalizeRanges(ranges)
  return ranges.filter(range => isWithinInterval(item.date, range))
}

export default function useSelection(id: string) {
  const {
    selection,
    hoverItem,
  } = containers[id] || (containers[id] = {
    selection: ref<Selection>({
      from: null,
      to: null,
    }),
    hoverItem: ref<CalendarItem>(null),
  })

  const isHovered = (item: CalendarItem) => !!hoverItem.value && item.date.getTime() === hoverItem.value.date.getTime()

  const isSelected = (item: CalendarItem) => {
    return !!((selection.value.from && selection.value.from.date.getTime() === item.date.getTime())
      || (selection.value.to && selection.value.to.date.getTime() === item.date.getTime()))
  }

  const isWithinSelection = (item: CalendarItem) => {
    if (!item.isCurrentMonth) {
      return false
    }

    const hoverSelection: Selection = {
      from: selection.value.from || hoverItem.value,
      to: selection.value.to || hoverItem.value,
    }
  
    if (hoverSelection.from && hoverSelection.to && isAfter(hoverSelection.from.date, hoverSelection.to.date)) {
      const from = hoverSelection.from
      const to = hoverSelection.to
      hoverSelection.from = to
      hoverSelection.to = from
    }
  
    return !!(hoverSelection.from
      && hoverSelection.to
      && isWithinInterval(item.date, {
        start: hoverSelection.from.date,
        end: hoverSelection.to.date,
      }))
  }

  const isSelectable = <F extends DateFormat>(item: CalendarItem, options: Options<F>) => {
    if (!item.isCurrentMonth) {
      return false
    }
  
    const selectableRanges = findRangesOfItem(item, options.selectableRanges)
    const blockedRanges = findRangesOfItem(item, options.blockedRanges)
    const wrapsBlockedRanges = selection.value.from && !selection.value.to && selectionWrapsRanges({
      from: selection.value.from,
      to: item,
    }, options.blockedRanges)
    const blockedForSelection = isBlockedForSelection(item, blockedRanges, options)
    const beforeMinDate = isBeforeMinDate(item, options.minDate)
    const afterMaxDate = isAfterMaxDate(item, options.maxDate)
    const satMinDays = satisfiesMinDays(selection.value, item, options)
  
    const defaultValue = !(
      (options.selectableRanges && !selectableRanges.length) ||
      blockedForSelection ||
      wrapsBlockedRanges ||
      !satMinDays ||
      beforeMinDate || afterMaxDate
    )
  
    if (options.selectable) {
      return options.selectable(item, {
        selectableRanges,
        blockedRanges,
        beforeMinDate,
        afterMaxDate,
        defaultValue,
        selection: selection.value,
      })
    }
  
    return defaultValue
  }

  return {
    selection,
    selectItem,
    hoverItem,
    isHovered,
    clear,
    isSelectable,
    isSelected,
    isWithinSelection,
    isBlocked,
    isBeforeMinDate,
    isAfterMaxDate,
  }
}