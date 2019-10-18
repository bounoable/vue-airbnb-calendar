import { computed, Ref, ref } from '@vue/composition-api'
import { CalendarItem } from './calendar-items'
import { CalendarContext } from '../context'
import Dictionary from '../dictionary'

export default function useCalendarItemStyle(items: Ref<CalendarItem[]>, context: Ref<CalendarContext>) {
  const pluginClasses = ref<string[][]>([])

  const classes = computed(() => {
    return items.value.map((item, i) => {
      let classes: string[] = []

      if (item.isCurrentMonth) {
        classes.push('AirbnbCalendarItem', 'is-bordered')
      }

      for (const plugin of context.value.calendarItemPlugins) {
        if (plugin.classes) {
          classes.push(...plugin.classes.apply(plugin, [item, context.value]))
        }
      }

      for (const name of pluginClasses.value[i] || []) {
        classes.push(name)
      }

      return classes
    })
  })

  const addClass = (item: CalendarItem, ...classNames: string[]) => {
    const index = items.value.indexOf(item)

    if (index === -1) {
      return
    }

    pluginClasses.value[index] = pluginClasses.value[index] || []

    for (const name of classNames) {
      if (pluginClasses.value[index].indexOf(name) === -1) {
        pluginClasses.value[index].push(name)
      }
    }
  }

  const removeClass = (item: CalendarItem, ...classNames: string[]) => {
    const index = items.value.indexOf(item)

    if (index === -1) {
      return
    }

    pluginClasses.value[index] = pluginClasses.value[index] || []

    for (const name of classNames) {
      const nameIndex = pluginClasses.value[index].indexOf(name)

      if (nameIndex === -1) {
        continue
      }

      pluginClasses.value[index].splice(nameIndex, 1)
    }
  }

  const styles = computed(() => {
    return items.value.map((item, i) => {
      let styles: Dictionary<string, number> = {}

      for (const plugin of context.value.calendarItemPlugins) {
        if (plugin.styles) {
          styles = {
            ...styles,
            ...plugin.styles.apply(plugin, [item, classes.value[i] || [], context.value])
          }
        }
      }

      return styles
    })
  })

  return {
    classes,
    addClass,
    removeClass,
    styles,
  }
}