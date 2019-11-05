import Plugin, { PluginFn } from './plugin';
import { Calendar } from './use/calendar';
import { Options as LocalizationOptions } from './use/localization';
export default interface Options extends OptionalOptions, Partial<RequiredOptions>, Partial<LocalizationOptions> {
}
export interface InternalOptions extends OptionalOptions, RequiredOptions, LocalizationOptions {
}
interface OptionalOptions {
    /**
     * The date that's displayed as the default / start month.
     */
    startMonth?: Date;
    /**
     * Limits the left side of the calendar to the month of the date.
     */
    firstMonth?: Date;
    /**
     * Limits the right side of the calendar to the month of the date.
     */
    lastMonth?: Date;
    /**
     * Listen for changes of internal state.
     */
    watch?: {
        /**
         * Listen for changes to the currently visible calendars.
         */
        visibleCalendars?(calendars: Calendar[], oldCalendars: Calendar[]): any;
        /**
         * Listen for changes to all rendered calendars.
         */
        renderedCalendars?(calendars: Calendar[], oldCalendars: Calendar[]): any;
    };
    /**
     * Plugins to use.
     */
    plugins?: (Plugin | PluginFn)[];
}
interface RequiredOptions {
    /**
     * The maximum number of visible months.
     */
    maxMonths: number;
}
export {};
