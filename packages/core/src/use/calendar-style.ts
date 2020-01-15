import { Ref, computed, ref, watch } from '@vue/composition-api'
import Dictionary from '../dictionary'
import { Calendar } from './calendar'

export interface MonthPosition {
  left?: string|number
  right?: string|number
}

export interface MonthStyle extends MonthPosition {
  width?: CSSStyleDeclaration['width']
  position?: CSSStyleDeclaration['position']
  transform?: CSSStyleDeclaration['transform']
  opacity?: CSSStyleDeclaration['opacity']
  zIndex?: CSSStyleDeclaration['zIndex']
}

export default function useCalendarStyle(renderedCalendars: Ref<Calendar[]>, visibleCalendars: Ref<Calendar[]>) {
  const monthStyles = computed(() => {
    const styles: Dictionary<Dictionary<MonthStyle, number>, number> = {}

    for (let i = 0; i < renderedCalendars.value.length; ++i) {
      const widthPercentage = 100 / visibleCalendars.value.length

      let style: MonthStyle = {}
      
      if (visibleCalendars.value.indexOf(renderedCalendars.value[i]) > -1) {
        style.position = 'static'
        style.width = widthPercentage + '%'
      } else {
        style.position = 'absolute'
        style.width = widthPercentage + '%'

        style.left = (-widthPercentage + (i * widthPercentage)) + '%'
      }

      styles[renderedCalendars.value[i].year] = styles[renderedCalendars.value[i].year] || {}
      styles[renderedCalendars.value[i].year][renderedCalendars.value[i].month] = style
    }

    return styles
  })

  return {
    monthStyles,
  }
}
