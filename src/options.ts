import { Locale } from 'date-fns'
import Plugin, { PluginFn } from './plugin'
import { Calendar } from './use/calendar'
import { Options as LocalizationOptions } from './use/localization'

interface BaseOptions {
  /**
   * The date that's displayed as the default / start month.
   */
  startMonth?: Date

  /**
   * Limits the left side of the calendar to the month of the date.
   */
  firstMonth?: Date

  /**
   * Limits the right side of the calendar to the month of the date.
   */
  lastMonth?: Date

  /**
   * Listen for changes of internal state.
   */
  watch?: {
    /**
     * Listen for changes to the currently visible calendars.
     * 
     * @param calendars The visible calendars.
     */
    visibleCalendars?(calendars: Calendar[]): any

    /**
     * Listen for changes to all rendered calendars.
     * 
     * @param calendars The rendered calendars.
     */
    renderedCalendars?(calendars: Calendar[]): any
  }

  /**
   * Plugins to use.
   */
  plugins?: (Plugin|PluginFn)[]
}

export default interface Options extends BaseOptions, Partial<LocalizationOptions> {
  /**
   * The maximum number of visible months.
   */
  maxMonths?: number
}

export interface InternalOptions extends BaseOptions, LocalizationOptions {
  dateFnsLocale: Locale
  maxMonths: number
}
