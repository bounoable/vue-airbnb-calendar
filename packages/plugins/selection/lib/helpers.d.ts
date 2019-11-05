import { Interval } from './options';
import { CalendarItem } from 'vue-airbnb-calendar/types/use/calendar-items';
export declare const normalizeRanges: (ranges?: Interval[] | (() => Interval[]) | undefined) => Interval[];
export declare const intervalOverlapsWith: (interval: Interval, ranges?: Interval[] | (() => Interval[]) | undefined) => boolean | undefined;
export declare const orderedInterval: (date1: Date, date2: Date) => Interval;
export declare const findRangesOfItem: (item: CalendarItem, ranges?: Interval[] | (() => Interval[]) | undefined) => Interval[];
export declare const findRangesOfDate: (date: Date, ranges?: Interval[] | (() => Interval[]) | undefined) => Interval[];
