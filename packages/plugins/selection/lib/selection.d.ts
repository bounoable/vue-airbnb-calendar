import { Ref } from '@vue/composition-api';
import { CalendarItem } from 'vue-airbnb-calendar/types/use/calendar-items';
import Options, { Selection, Interval, DateFormat } from './options';
export declare const selectItem: (item: CalendarItem, selection: Ref<Selection>) => void;
export declare const clear: (selection: Ref<Selection>) => void;
export declare const selectionWrapsRanges: (selection: Selection, ranges?: Interval[] | (() => Interval[]) | undefined) => boolean | undefined;
export default function useSelection<F extends DateFormat>(id: string, options: Ref<Options<F>>): {
    selection: Ref<Selection>;
    selectItem: (item: CalendarItem, selection: Ref<Selection>) => void;
    hoverItem: Ref<CalendarItem | null>;
    analysis: Ref<{
        [key: number]: import("./analysis").StaticDateInfo;
    }>;
    isHovered: (item: CalendarItem) => boolean;
    clear: (selection: Ref<Selection>) => void;
    isSelectable: <F_1 extends string | undefined>(item: CalendarItem, analysis: {
        [key: number]: import("./analysis").StaticDateInfo;
    }, options: Options<F_1>) => boolean;
    isSelected: (item: CalendarItem) => boolean;
    isWithinSelection: (item: CalendarItem) => boolean;
    analyzeOptions: <F_2 extends string | undefined>(options?: Options<F_2> | undefined) => {
        [key: number]: import("./analysis").StaticDateInfo;
    };
    hasReservation: (item: CalendarItem, analysis: {
        [key: number]: import("./analysis").StaticDateInfo;
    }) => boolean;
    isBeforeMinDate: (item: CalendarItem, minDate?: Date | undefined) => boolean;
    isAfterMaxDate: (item: CalendarItem, maxDate?: Date | undefined) => boolean;
    stopHandles: Ref<(() => void)[]>;
    destroy: () => void;
};
