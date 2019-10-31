// @ts-ignore
import './style.sass'
import { PluginFn } from '../../plugin'
import { format } from 'date-fns'
import { watch, onMounted } from '@vue/composition-api'
import { cssVar } from '../../helpers/styles'
import useSelection from './selection'
import Options, { CalendarItemColors } from './options'

export default <F extends string|undefined = undefined>(options: Options<F> = {}): PluginFn => {
  return (rootContext, { installCalendarItemPlugin }) => {
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
      isBlocked,
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
        const blocked = isBlocked(item, options)
        const hovered = isHovered(item)
        const withinSelection = isWithinSelection(item)
        const selected = isSelected(item)
        const highlighted = options.highlight ? options.highlight(item, {
          hovered,
          selectable,
          selected,
          withinSelection,
          blocked,
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

        if (blocked) {
          classes.push('is-blocked')
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

        if (options.css.blocked && classes.indexOf('is-blocked') > -1) {
          styles = {
            ...styles,
            ...options.css.blocked as any,
          }
        }

        return styles
      },

      on: {
        click(item) {
          if (isSelectable(item, options)) {
            selectItem(item, selection)
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
