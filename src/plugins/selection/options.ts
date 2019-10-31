import { CalendarItem } from '@/use/calendar-items';

export type ItemState = 'withinSelection'|'selectable'|'unselectable'|'selected'|'hovered'|'highlighted'|'blocked'

export interface Selection {
  from: CalendarItem|null
  to: CalendarItem|null
}

export interface Interval {
  start: Date
  end: Date
}

export default interface Options<F extends string|undefined> {
  /**
   * Custom colors for the calendar item states.
   */
  colors?: {
    [state in ItemState|'base']?: CalendarItemColors
  }

  /**
   * Custom CSS for the calendar item states.
   */
  css?: {
    [state in ItemState|'base']?: Partial<CSSStyleDeclaration>
  }

  /**
   * date-fns format string for the dates provided for "onSelect".
   * When no format is given, a Date object is provided instead.
   */
  dateFormat?: F

  /**
   * The minimum date that can be selected.
   */
  minDate?: Date

  /**
   * The maximum date that can be selected.
   */
  maxDate?: Date

  /**
   * Specifiy date ranges that can be selected.
   */
  selectableRanges?: Interval[]|(() => Interval[])

  /**
   * Specify date ranges that are blocked.
   */
  blockedRanges?: Interval[]|(() => Interval[])

  /**
   * Specify the minimum days the user has to select.
   */
  minDays?: number|((state: {
    selection: Selection
  }) => number)

  /**
   * Custom function to determine if a calendar item can be selected.
   * Overrides the minDate/maxDate/ranges options.
   * 
   * @param item The calendar item.
   * @param state The item state.
   */
  selectable?(item: CalendarItem, state: {
    /**
     * The current selection.
     */
    selection: Selection

    /**
     * The selectable ranges the calendar item is in.
     */
    selectableRanges: Interval[]

    /**
     * The blocked ranges the calendar item is in.
     */
    blockedRanges: Interval[]

    /**
     * Indicates if the calendar item is before the specified minimum date.
     */
    beforeMinDate: boolean

    /**
     * Indicates if the calendar item is after the specified maximum date.
     */
    afterMaxDate: boolean

    /**
     * The default result, determined by minDate/maxDate/ranges.
     */
    defaultValue: boolean
  }): boolean

  /**
   * Function to determine if a calendar item is highlighted.
   * 
   * @param item The calendar item.
   * @param state The item state.
   */
  highlight?(item: CalendarItem, state: {
    /**
     * Indicates if the calendar item is selectable.
     */
    selectable: boolean

    /**
     * Indicates if the calendar item is selected.
     */
    selected: boolean

    /**
     * Indicates if the calendar item is within the current selection.
     */
    withinSelection: boolean

    /**
     * Indicates if the calendar item is hovered.
     */
    hovered: boolean

    /**
     * Indicates if the calendar item is blocked.
     */
    blocked: boolean
  }): boolean

  onSelect?(selection: {
    from: (F extends undefined ? Date : string)|null
    to: (F extends undefined ? Date : string)|null
  }): any
}

export interface CalendarItemColors {
  background?: string
  border?: string
  text?: string
}