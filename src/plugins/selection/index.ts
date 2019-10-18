// @ts-ignore
import './style.sass'
import { PluginFn } from '../../plugin'
import Dictionary from '../../dictionary'
import { isAfter, isWithinInterval, format, Interval, isBefore } from 'date-fns'
import { CalendarItem } from '../../use/calendar-items'
import { Ref, ref, watch, onMounted } from '@vue/composition-api'
import { cssVar } from '../../helpers/styles'

export interface Options<F extends string|undefined> {
  /**
   * Custom colors for the calendar item states.
   */
  colors?: {
    /**
     * Calendar item is within selection range / hovered.
     */
    withinSelection?: CalendarItemColors
    /**
     * Calendar item is selectable.
     */
    selectable?: CalendarItemColors
    /**
     * Calendar item is not selectable.
     */
    unselectable?: CalendarItemColors
    /**
     * Calendar item is selected.
     */
    selected?: CalendarItemColors
    /**
     * Calendar item is highlighted.
     */
    highlighted?: CalendarItemColors
  }

  /**
   * date-fns format string for the dates provided for "onSelect".
   * When no format is given, a Date object is provided instead.
   */
  dateFormat?: F

  /**
   * The minimum date that can be selected.
   */
  minDate?: Date

  /**
   * The maximum date that can be selected.
   */
  maxDate?: Date

  /**
   * Specifiy date ranges that can be selected.
   */
  ranges?: Interval[]|(() => Interval[])

  /**
   * Custom function to determine if a calendar item can be selected.
   * Overrides the minDate/maxDate/ranges options.
   * 
   * @param item The calendar item.
   * @param state The item state.
   */
  selectable?(item: CalendarItem, state: {
    /**
     * The current selection.
     */
    selection: Selection

    /**
     * The ranges the calendar item is in.
     */
    ranges: Interval[]

    /**
     * Indicates if the calendar item is before the specified minimum date.
     */
    beforeMinDate: boolean

    /**
     * Indicates if the calendar item is after the specified maximum date.
     */
    afterMaxDate: boolean

    /**
     * The default result, determined by minDate/maxDate/ranges.
     */
    defaultValue: boolean
  }): boolean

  /**
   * Function to determine if a calendar item is highlighted.
   * 
   * @param item The calendar item.
   * @param state The item state.
   */
  highlight?(item: CalendarItem, state: {
    /**
     * Indicates if the calendar item is selectable.
     */
    selectable: boolean

    /**
     * Indicates if the calendar item is selected.
     */
    selected: boolean

    /**
     * Indicates if the calendar item is within the current selection.
     */
    withinSelection: boolean

    /**
     * Indicates if the calendar item is hovered.
     */
    hovered: boolean
  }): boolean

  onSelect?(selection: {
    from: (F extends undefined ? Date : string)|null
    to: (F extends undefined ? Date : string)|null
  }): any
}

interface CalendarItemColors {
  background?: string
  border?: string
  text?: string
}

interface Selection {
  from: CalendarItem|null
  to: CalendarItem|null
}

const containers: Dictionary<{
  selection: Ref<Selection>
  hoverItem: Ref<CalendarItem|null>
}> = {}

const useSelection = (id: string) => {
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

  const selectItem = (item: CalendarItem) => {
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

    selection.value.to = item
  }

  const clear = () => {
    selection.value.from = null
    selection.value.to = null
  }

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

    const ranges = findRangesOfItem(item, options.ranges)
    const beforeMinDate = isBeforeMinDate(item, options.minDate)
    const afterMaxDate = isAfterMaxDate(item, options.maxDate)

    const defaultValue = !(
      (options.ranges && !ranges.length) ||
      beforeMinDate || afterMaxDate
    )

    if (options.selectable) {
      return options.selectable(item, {
        ranges,
        beforeMinDate,
        afterMaxDate,
        defaultValue,
        selection: selection.value,
      })
    }

    return defaultValue
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
    isBeforeMinDate,
    isAfterMaxDate,
  }
}

export default <F extends string|undefined = undefined>(options: Options<F> = {}): PluginFn => {
  return (rootContext, { installRootPlugin, installCalendarItemPlugin }) => {
    const {
      selection,
      hoverItem,
      isHovered,
      selectItem,
      isSelectable,
      isSelected,
      isWithinSelection,
      isBeforeMinDate,
      isAfterMaxDate,
      clear: clearSelection,
    } = useSelection(rootContext.id)

    onMounted(() => {
      for (const state in options.colors) {
        const colors = options.colors[state as keyof Options<F>['colors']] as CalendarItemColors

        for (const key in colors) {
          const color = colors[key as keyof CalendarItemColors]!
          document.documentElement.style.setProperty(cssVar(`sel-color-${state}-${key}`), color)
        }
      }
    })

    watch(selection, selection => {
      if ((selection.from || selection.to) && options.onSelect) {
        // @ts-ignore
        const from: (F extends undefined ? Date : string)|null = selection.from
          ? (typeof options.dateFormat === 'undefined' ? selection.from.date : format(selection.from.date, options.dateFormat as string))
          : null
        
        // @ts-ignore
        const to: (F extends undefined ? Date : string)|null = selection.to
          ? (typeof options.dateFormat === 'undefined' ? selection.to.date : format(selection.to.date, options.dateFormat as string))
          : null
        
        options.onSelect.apply(options, [{
          from,
          to,
        }])
      }
    }, { deep: true })

    installCalendarItemPlugin({
      classes(item) {
        const classes: string[] = []

        if (!item.isCurrentMonth) {
          return classes
        }
  
        const selectable = isSelectable(item, options)
        const hovered = isHovered(item)
        const withinSelection = isWithinSelection(item)
        const selected = isSelected(item)
        const highlighted = options.highlight ? options.highlight(item, {
          hovered,
          selectable,
          selected,
          withinSelection,
        }) : false

        if (selectable) {
          classes.push('is-selectable')
        } else {
          classes.push('is-unselectable')
        }

        if (hovered) {
          classes.push('is-hovered')
        }

        if (withinSelection) {
          classes.push('is-within-selection')
        }

        if (selected || item === hoverItem.value) {
          classes.push('is-selected')
        }

        if (highlighted) {
          classes.push('is-highlighted')
        }
  
        return classes
      },

      on: {
        click(item) {
          if (isSelectable(item, options)) {
            selectItem(item)
          }
        },
        mouseenter(item) {
          if (!item.isCurrentMonth || isBeforeMinDate(item, options.minDate) || isAfterMaxDate(item, options.maxDate)) {
            hoverItem.value = null
            return
          }

          hoverItem.value = item
        },
      },
    })

    installRootPlugin({
      on: {
        mouseleave() {
          hoverItem.value = null

          if (!selection.value.to) {
            clearSelection()
          }
        }
      },
    })
  }
}
