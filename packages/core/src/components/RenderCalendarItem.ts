import { createComponent } from '@vue/composition-api'
import { CalendarItem } from '../use/calendar-items'
import { CalendarItemPlugin } from '../plugin'
import { format } from 'date-fns'

interface Props {
  item: CalendarItem
  renderFns: Array<CalendarItemPlugin['calendarItemRenderFn'] & {}>
  classes: any
  styles: any
}

export default createComponent<Props>({
  props: {
    item: Object,
    renderFns: Array,
    classes: {},
    styles: {},
  } as const,

  render(h) {
    const p = this as Props

    let vnode = h('div', {
      class: p.classes,
      style: p.styles,
    }, [
      h('span', {
        class: 'AirbnbCalendarItem__day',
      }, format(p.item.date, 'd'))
    ])

    for (const renderFn of p.renderFns) {
      vnode = renderFn(h, vnode, {
        item: p.item,
        classes: p.classes,
      })
    }

    return vnode
  },
})