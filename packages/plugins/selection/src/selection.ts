import { Ref, ref, watch } from '@vue/composition-api'
import { CalendarItem } from 'vue-airbnb-calendar/types/use/calendar-items'
import { isBefore, isAfter, isWithinInterval, isSameDay } from 'date-fns'
import Dictionary from 'vue-airbnb-calendar/types/dictionary'
import Options, { Selection, Interval, DateFormat, ReservationOptions } from './options'
import { intervalOverlapsWith, findRangesOfItem, normalizeRanges } from './helpers'
import { validateCheckInOut, hasReservation } from './reservations'
import { Analysis, analyzeOptions } from './analysis'

const containers: Dictionary<{
  selection: Ref<Selection>
  hoverItem: Ref<CalendarItem|null>
  analysis: Ref<Analysis>
}> = {}

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

export const selectionWrapsRanges = (selection: Selection, ranges?: Interval[]|(() => Interval[])) => {
  if (!ranges) {
    return
  }
  
  if (!(selection.from && selection.to)) {
    return false
  }

  return intervalOverlapsWith({ start: selection.from.date, end: selection.to.date }, ranges)
}

const isBeforeMinDate = (item: CalendarItem, minDate?: Date) => {
  return !!minDate && isBefore(item.date, minDate)
}

const isAfterMaxDate = (item: CalendarItem, maxDate?: Date) => {
  return !!maxDate && isAfter(item.date, maxDate)
}

export default function useSelection<F extends DateFormat>(id: string, options: Ref<Options<F>>) {
  const {
    selection,
    hoverItem,
    analysis,
  } = containers[id] || (containers[id] = {
    selection: ref<Selection>({
      from: null,
      to: null,
    }),
    hoverItem: ref<CalendarItem>(null),
    analysis: ref({}),
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

  const isSelectable = <F extends DateFormat>(item: CalendarItem, analysis: Analysis, options: Options<F>) => {
    if (!item.isCurrentMonth) {
      return false
    }

    const resOptions = options.reservations || {}
    const minDays = resOptions.minDays instanceof Function
      ? resOptions.minDays({ selection: selection.value })
      : resOptions.minDays || 0

    const reservationRanges = normalizeRanges(resOptions.ranges || [])
    const selectableRanges = findRangesOfItem(item, options.selectableRanges)
    const beforeMinDate = isBeforeMinDate(item, options.minDate)
    const afterMaxDate = isAfterMaxDate(item, options.maxDate)
    const validCheckInOut = validateCheckInOut(selection.value, item, analysis, reservationRanges, minDays, options)
  
    const defaultValue = !(
      (options.selectableRanges && !selectableRanges.length) ||
      !validCheckInOut ||
      beforeMinDate || afterMaxDate
    )
  
    if (options.selectable) {
      return options.selectable(item, {
        selectableRanges,
        reservationRanges,
        beforeMinDate,
        afterMaxDate,
        defaultValue,
        selection: selection.value,
      })
    }
  
    return defaultValue
  }

  const stopHandles = ref<ReturnType<typeof watch>[]>([])

  stopHandles.value.push(
    watch(options, options => {
      analysis.value = analyzeOptions(options)
    })
  )

  const destroy = () => {
    for (const stop of stopHandles.value) {
      stop()
    }
  }

  return {
    selection,
    selectItem,
    hoverItem,
    analysis,
    isHovered,
    clear,
    isSelectable,
    isSelected,
    isWithinSelection,
    analyzeOptions,
    hasReservation,
    isBeforeMinDate,
    isAfterMaxDate,
    stopHandles,
    destroy,
  }
}