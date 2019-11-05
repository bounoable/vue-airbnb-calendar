import { Ref } from '@vue/composition-api';
import { InternalOptions } from '../options';
export interface Calendar {
    year: number;
    month: number;
}
export default function useCalendar(picker: Ref<HTMLElement | null>, options: Ref<InternalOptions>): {
    pickerWidth: Ref<number>;
    startCalendar: Ref<Calendar>;
    endCalendar: Ref<Calendar>;
    visibleCalendars: Ref<Calendar[]>;
    renderedCalendars: Ref<Calendar[]>;
    shiftCalendar: (calendar: Calendar, years: number, months: number) => Calendar;
    shiftStartCalendar: (years: number, months: number) => void;
    moduloFix: (num: number, max?: number) => number;
    reachedMin: Ref<boolean>;
    reachedMax: Ref<boolean>;
};
