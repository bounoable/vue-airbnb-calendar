import { PluginFn } from 'vue-airbnb-calendar/lib/plugin'
import { format, isSameDay } from 'date-fns'
import { watch, onMounted, Ref, isRef, ref } from '@vue/composition-api'
import { cssVar } from 'vue-airbnb-calendar/lib/helpers/styles'
import useSelection from './selection'
import Options, { CalendarItemColors, DateFormat } from './options'
import { findRangesOfItem } from './helpers'
import { renderCheckInDay, renderCheckOutDay } from './renderCheckInOutDay'

export default <F extends DateFormat = undefined>(opt: Options<F>|Ref<Options<F>> = {}): PluginFn => {
  const options = (isRef(opt) ? opt : ref<Options<F>>(opt)) as Ref<Options<F>>

  return (rootContext, { installRootPlugin, installCalendarItemPlugin }, onDestroy) => {
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
      analysis,
      hasReservation,
      stopHandles,
      destroy,
      clear: clearSelection,
    } = useSelection(rootContext.id, options)

    onMounted(() => {
      stopHandles.value.push(
        watch(() => options.value.colors, colors => {
          for (const state in colors) {
            const stateColors = colors[state as keyof Options<F>['colors']] as CalendarItemColors
  
            for (const key in stateColors) {
              const color = stateColors[key as keyof CalendarItemColors]!
              document.documentElement.style.setProperty(cssVar(`sel-color-${state}-${key}`), color)
            }
          }
        }, { immediate: true })
      )
    })

    onDestroy(() => {
      destroy()

      // Doesn't work anymore ?
      for (const state in options.value.colors) {
        const stateColors = options.value.colors[state as keyof Options<F>['colors']] as CalendarItemColors

        for (const key in stateColors) {
          document.documentElement.style.removeProperty(cssVar(`sel-color-${state}-${key}`))
        }
      }
    })

    stopHandles.value.push(
      watch(selection, sel => {
        if ((sel.from || sel.to) && options.value.onSelect) {
          // @ts-ignore
          let from: (F extends undefined ? Date : string)|null = sel.from
            ? (typeof options.value.dateFormat === 'undefined' ? sel.from.date : format(sel.from.date, options.value.dateFormat as string))
            : null
          
          // @ts-ignore
          let to: (F extends undefined ? Date : string)|null = sel.to
            ? (typeof options.value.dateFormat === 'undefined' ? sel.to.date : format(sel.to.date, options.value.dateFormat as string))
            : null
          
          options.value.onSelect.apply(options, [{
            from,
            to,
          }])
        }
      }, { deep: true })
    )

    installRootPlugin({
      on: {
        keyup(el, ev) {
          if (ev.key === 'Escape') {
            clearSelection(selection)
          }
        }
      },
    })

    installCalendarItemPlugin({
      classes(item) {
        const classes: string[] = []

        if (!item.isCurrentMonth) {
          return classes
        }
  
        const selectable = isSelectable(item, analysis.value, options.value as Options<F>)
        const blocked = hasReservation(item, analysis.value)
        const hovered = isHovered(item)
        const withinSelection = isWithinSelection(item)
        const selected = isSelected(item)
        const highlighted = options.value.highlight ? options.value.highlight(item, {
          hovered,
          selectable,
          selected,
          withinSelection,
          blocked,
        }) : false

        let blockedStartDay = false
        let blockedEndDay = false

        if (options.value.reservations && options.value.reservations.allowCheckInOutOverlap) {
          const blockedRanges = findRangesOfItem(item, options.value.reservations ? options.value.reservations.ranges : undefined)
  
          for (const range of blockedRanges) {
            if (isSameDay(range.start, item.date)) {
              blockedStartDay = true
            }
  
            if (isSameDay(range.end, item.date)) {
              blockedEndDay = true
            }
          }
        }

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

        if (selected) {
          classes.push('is-selected')
        }

        if (highlighted) {
          classes.push('is-highlighted')
        }

        if (blocked) {
          classes.push('is-blocked')
        }

        if (!(blockedStartDay && blockedEndDay)) {
          if (blockedStartDay) {
            classes.push('is-blocked-start-day')
          }
  
          if (blockedEndDay) {
            classes.push('is-blocked-end-day')
          }
        }
  
        return classes
      },

      styles(item, classes, ctx) {
        let styles: { [key: string]: string|number } = {}

        if (!options.value.css) {
          return styles
        }

        if (options.value.css.base) {
          styles = {
            ...styles,
            ...options.value.css.base as any,
          }
        }

        if (options.value.css.selectable && classes.indexOf('is-selectable') > -1) {
          styles = {
            ...styles,
            ...options.value.css.selectable as any,
          }
        }

        if (options.value.css.unselectable && classes.indexOf('is-unselectable') > -1) {
          styles = {
            ...styles,
            ...options.value.css.unselectable as any,
          }
        }

        if (options.value.css.hovered && classes.indexOf('is-hovered') > -1) {
          styles = {
            ...styles,
            ...options.value.css.hovered as any,
          }
        }

        if (options.value.css.withinSelection && classes.indexOf('is-within-selection') > -1) {
          styles = {
            ...styles,
            ...options.value.css.withinSelection as any,
          }
        }

        if (options.value.css.selected && classes.indexOf('is-selected') > -1) {
          styles = {
            ...styles,
             ...options.value.css.selected as any,
          }
        }

        if (options.value.css.highlighted && classes.indexOf('is-highlighted') > -1) {
          styles = {
            ...styles,
            ...options.value.css.highlighted as any,
          }
        }

        if (options.value.css.blocked && classes.indexOf('is-blocked') > -1) {
          styles = {
            ...styles,
            ...options.value.css.blocked as any,
          }
        }

        return styles
      },

      on: {
        click(item) {
          if (isSelectable(item, analysis.value, options.value)) {
            selectItem(item, selection)
          }
        },
        mouseenter(item) {
          if (!item.isCurrentMonth || isBeforeMinDate(item, options.value.minDate) || isAfterMaxDate(item, options.value.maxDate)) {
            hoverItem.value = null
            return
          }

          hoverItem.value = item
        },
        mouseleave(item) {
          if (hoverItem.value === item) {
            hoverItem.value = null
          }
        },
      },

      calendarItemRenderFn(h, prev, { classes }) {
        if (!(options.value.reservations && options.value.reservations.allowCheckInOutOverlap)) {
          return prev
        }

        if (classes.indexOf('is-hovered') > -1 || classes.indexOf('is-selected') > -1) {
          return prev
        }

        if (classes.indexOf('is-blocked-start-day') > -1) {
          prev.children!.unshift(renderCheckInDay(h))
        }

        if (classes.indexOf('is-blocked-end-day') > -1) {
          prev.children!.unshift(renderCheckOutDay(h))
        }

        return prev
      }
    })
  }
}

export { Options }
