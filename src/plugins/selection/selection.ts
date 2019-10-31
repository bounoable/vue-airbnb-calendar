import { Ref, ref } from '@vue/composition-api'
import { CalendarItem } from '../../use/calendar-items'
import { isBefore, isAfter, isWithinInterval, areIntervalsOverlapping, differenceInDays, subDays, addDays } from 'date-fns'
import Dictionary from '../../dictionary'
import Options, { Selection, Interval } from './options'

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

const orderedInterval = (date1: Date, date2: Date): Interval => {
  const start = isBefore(date1, date2) ? date1 : date2
  const end = date1 === start ? date2 : date1

  return { start, end }
}

const selectionWrapsRanges = (selection: Selection, ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return
  }

  if (!(selection.from && selection.to)) {
    return false
  }

  return intervalWrapsRanges({ start: selection.from.date, end: selection.to.date }, ranges)
}

const intervalWrapsRanges = (interval: Interval, ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return
  }

  ranges = ranges instanceof Function ? ranges() : ranges
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

const satisfiesMinDays = <F extends string|undefined>(selection: Selection, item: CalendarItem, options: Options<F>) => {
  if (!options.minDays) {
    return true
  }

  const minDays = options.minDays instanceof Function ? options.minDays({ selection }) : options.minDays

  if (!(selection.from || selection.to)) {
    const ranges: Interval[] = [
      { start: subDays(item.date, minDays), end: item.date },
      { start: item.date, end: addDays(item.date, minDays) }
    ]

    if (intervalWrapsRanges(ranges[0], options.blockedRanges) && intervalWrapsRanges(ranges[1], options.blockedRanges)) {
      return false
    }
  }

  if (selection.from && !selection.to) {
    const { start, end } = orderedInterval(selection.from.date, item.date)
    const days = differenceInDays(end, start)

    if (days < minDays) {
      return false
    }
  }

  return true
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

  const isSelectable = <F extends string|undefined>(item: CalendarItem, options: Options<F>) => {
    if (!item.isCurrentMonth) {
      return false
    }

    if (isBlocked(item, options)) {
      return false
    }

    const selectableRanges = findRangesOfItem(item, options.selectableRanges)
    const blockedRanges = findRangesOfItem(item, options.blockedRanges)
    const wrapsBlockedRanges = selection.value.from && selectionWrapsRanges({
      from: selection.value.from,
      to: item,
    }, options.blockedRanges)
    const beforeMinDate = isBeforeMinDate(item, options.minDate)
    const afterMaxDate = isAfterMaxDate(item, options.maxDate)
    const satMinDays = satisfiesMinDays(selection.value, item, options)

    const defaultValue = !(
      (options.selectableRanges && !selectableRanges.length) ||
      blockedRanges.length ||
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

  const isBlocked = <F extends string|undefined>(item: CalendarItem, options: Options<F>) => {
    return !!findRangesOfItem(item, options.blockedRanges).length
  }

  const isBeforeMinDate = (item: CalendarItem, minDate?: Date) => {
    return !!minDate && isBefore(item.date, minDate)
  }

  const isAfterMaxDate = (item: CalendarItem, maxDate?: Date) => {
    return !!maxDate && isAfter(item.date, maxDate)
  }

  const findRangesOfItem = (item: CalendarItem, ranges?: Interval[]|(() => Interval[])) => {
    if (!ranges) {
      return []
    }

    ranges = ranges instanceof Function ? ranges() : ranges
    return ranges.filter(range => isWithinInterval(item.date, range))
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