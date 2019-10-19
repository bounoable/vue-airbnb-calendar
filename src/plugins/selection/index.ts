// @ts-ignore
import './style.sass'
import { PluginFn } from '../../plugin'
import Dictionary from '../../dictionary'
import { isAfter, isWithinInterval, format, Interval, isBefore } from 'date-fns'
import { CalendarItem } from '../../use/calendar-items'
import { Ref, ref, watch, onMounted } from '@vue/composition-api'
import { cssVar } from '../../helpers/styles'

export type ItemState = 'withinSelection'|'selectable'|'unselectable'|'selected'|'hovered'|'highlighted'

export interface Options<F extends string|undefined> {
  /**
   * Custom colors for the calendar item states.
   */
  colors?: {
    [state in ItemState|'base']?: CalendarItemColors
  }

  /**
   * Custom CSS for the calendar item states.
   */
  css?: {
    [state in ItemState|'base']?: Partial<CSSStyleDeclaration>
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

    onMounted(() => watch(() => options.colors, colors => {
      for (const state in colors) {
        const stateColors = colors[state as keyof Options<F>['colors']] as CalendarItemColors

        for (const key in stateColors) {
          const color = stateColors[key as keyof CalendarItemColors]!
          document.documentElement.style.setProperty(cssVar(`sel-color-${state}-${key}`), color)
        }
      }
    }))

    watch(selection, sel => {
      if (sel.from && sel.to && isBefore(sel.to.date, sel.from.date)) {
        selection.value = {
          from: sel.to,
          to: sel.from,
        }
        return
      }

      if ((sel.from || sel.to) && options.onSelect) {
        // @ts-ignore
        let from: (F extends undefined ? Date : string)|null = sel.from
          ? (typeof options.dateFormat === 'undefined' ? sel.from.date : format(sel.from.date, options.dateFormat as string))
          : null
        
        // @ts-ignore
        let to: (F extends undefined ? Date : string)|null = sel.to
          ? (typeof options.dateFormat === 'undefined' ? sel.to.date : format(sel.to.date, options.dateFormat as string))
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

      styles(item, classes, ctx) {
        let styles: { [key: string]: string|number } = {}

        if (!options.css) {
          return styles
        }

        if (options.css.base) {
          styles = {
            ...styles,
            ...options.css.base as any,
          }
        }

        if (options.css.selectable && classes.indexOf('is-selectable') > -1) {
          styles = {
            ...styles,
            ...options.css.selectable as any,
          }
        }

        if (options.css.unselectable && classes.indexOf('is-unselectable') > -1) {
          styles = {
            ...styles,
            ...options.css.unselectable as any,
          }
        }

        if (options.css.hovered && classes.indexOf('is-hovered') > -1) {
          styles = {
            ...styles,
            ...options.css.hovered as any,
          }
        }

        if (options.css.withinSelection && classes.indexOf('is-within-selection') > -1) {
          styles = {
            ...styles,
            ...options.css.withinSelection as any,
          }
        }

        if (options.css.selected && classes.indexOf('is-selected') > -1) {
          styles = {
            ...styles,
             ...options.css.selected as any,
          }
        }

        if (options.css.highlighted && classes.indexOf('is-highlighted') > -1) {
          styles = {
            ...styles,
            ...options.css.highlighted as any,
          }
        }

        return styles
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
        mouseleave(item) {
          if (hoverItem.value === item) {
            hoverItem.value = null
          }
        }
      },
    })
  }
}
