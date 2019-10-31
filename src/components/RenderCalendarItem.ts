import { createComponent } from '@vue/composition-api'
import { CalendarItem } from '../use/calendar-items'
import { CalendarItemPlugin } from '../plugin'
import { format } from 'date-fns'

interface Props {
  item: CalendarItem
  renderFns: Array<CalendarItemPlugin['calendarItemRenderFn'] & {}>
}

export default createComponent<Props>({
  props: {
    item: Object,
    renderFns: Array,
  } as const,

  render(h) {
    const p = this as Props
    let vnode = h('span', {
      class: 'AirbnbCalendarItem__day',
    }, format(p.item.date, 'd'))

    for (const renderFn of p.renderFns) {
      vnode = renderFn(h, p.item, vnode)
    }

    return vnode
  },
})