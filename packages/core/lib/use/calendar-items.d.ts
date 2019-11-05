import { Ref } from '@vue/composition-api';
import { Calendar } from './calendar';
export interface CalendarItem {
    date: Date;
    isCurrentMonth: boolean;
}
export interface CalendarRow {
    items: CalendarItem[];
}
export default function useCalendarItems(calendar: Ref<Calendar>): {
    firstOfMonth: Ref<Date>;
    lastOfMonth: Ref<Date>;
    currentMonthDates: Ref<Date[]>;
    prevMonthDates: Ref<Date[]>;
    nextMonthDates: Ref<Date[]>;
    calendarItems: Ref<CalendarItem[]>;
    calendarRows: Ref<CalendarRow[]>;
};
