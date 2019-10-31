import { createComponent } from '@vue/composition-api'
import { CalendarItem } from '../use/calendar-items'
import { InternalOptions } from '../options'

interface Props {
  item: CalendarItem
  renderFn: InternalOptions['calendarItemRenderFn'] & {}
}

export default createComponent<Props>({
  props: {
    item: Object,
    renderFn: Function,
  } as const,

  render(h) {
    const t = this as any
    return t.renderFn(h, t.item)
  },
})