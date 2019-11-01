import { CalendarItem } from './use/calendar-items'
import { CalendarContext, RootContext } from './context'
import Dictionary from './dictionary'
import { CreateElement, VNode } from 'vue'

export default interface Plugin {
  install(
    context: RootContext,
    helpers: {
      installRootPlugin(plugin: RootPlugin): void
      installCalendarItemPlugin(plugin: CalendarItemPlugin): void
    }
  ): any

  destroy?(): any
}

export type PluginFn = Plugin['install']

export interface RootPlugin {
  on?: {
    [K in keyof HTMLElementEventMap]?: (
      el: HTMLElement,
      ev: HTMLElementEventMap[K],
      context: RootContext
    ) => any
  }
}

export interface CalendarItemPlugin {
  on?: {
    [K in keyof HTMLElementEventMap]?: (
      item: CalendarItem,
      el: HTMLElement,
      ev: HTMLElementEventMap[K],
      helpers: CalendarItemPluginHelpers,
      context: CalendarContext
    ) => any
  }

  /**
   * Custom render function for calendar items.
   */
  calendarItemRenderFn?(h: CreateElement, prev: VNode, state: {
    item: CalendarItem
    classes: string[]
  }): VNode

  classes?(item: CalendarItem, context: CalendarContext): string[]
  styles?(item: CalendarItem, classes: string[], context: CalendarContext): Dictionary<string|number>
}

export interface CalendarItemPluginHelpers {
  addClass(...classNames: string[]): any
  removeClass(...classNames: string[]): any
}
