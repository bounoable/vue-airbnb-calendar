import Options, { Selection, Interval } from './options';
import { CalendarItem } from 'vue-airbnb-calendar/types/use/calendar-items';
export declare const hasReservation: (item: CalendarItem, analysis: {
    [key: number]: import("./analysis").StaticDateInfo;
}) => boolean;
export declare const validateCheckInOut: <F extends string | undefined>(selection: Selection, item: CalendarItem, analysis: {
    [key: number]: import("./analysis").StaticDateInfo;
}, reservationRanges: Interval[], minDays: number, options: Options<F>) => boolean;
