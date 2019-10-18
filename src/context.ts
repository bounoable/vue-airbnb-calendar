import { InternalOptions } from './options'
import { Calendar } from './compose/calendar'
import { CalendarItemPlugin } from './plugin'

export interface RootContext {
  id: string
  options: InternalOptions
  el: HTMLElement|null
  visibleCalendars: Calendar[]
  calendarItemPlugins: CalendarItemPlugin[]
}

export interface CalendarContext extends RootContext {
  calendar: Calendar
}
