import { Ref, ref } from '@vue/composition-api'
import { CalendarItem } from '../../use/calendar-items'
import { isBefore, isAfter, isWithinInterval, areIntervalsOverlapping, differenceInDays, Interval } from 'date-fns'
import Dictionary from '../../dictionary'
import Options, { Selection } from './options'

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

    let hasMinDays = true
    if (selection.value.from && !selection.value.to && options.minDays) {
      const minDays = options.minDays instanceof Function ? options.minDays({
        selection: selection.value
      }) : options.minDays
      const { start, end } = orderedInterval(selection.value.from.date, item.date)
      const days = differenceInDays(end, start)

      if (days < minDays) {
        hasMinDays = false
      }
    }

    const defaultValue = !(
      (options.selectableRanges && !selectableRanges.length) ||
      blockedRanges.length ||
      wrapsBlockedRanges ||
      !hasMinDays ||
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

  const selectionWrapsRanges = (selection: Selection, ranges?: Interval[]|(() => Interval[])) => {
    if (!ranges) {
      return
    }

    ranges = ranges instanceof Function ? ranges() : ranges
    if (!(ranges.length && selection.from && selection.to)) {
      return false
    }

    const selectionInterval = orderedInterval(selection.from.date, selection.to.date)

    for (const range of ranges) {
      if (areIntervalsOverlapping(selectionInterval, range)) {
        return true
      }
    }

    return false
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