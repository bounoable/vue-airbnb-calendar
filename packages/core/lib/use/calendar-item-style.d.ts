import { Ref } from '@vue/composition-api';
import { CalendarItem } from './calendar-items';
import { CalendarContext } from '../context';
export default function useCalendarItemStyle(items: Ref<CalendarItem[]>, context: Ref<CalendarContext>): {
    classes: Ref<string[][]>;
    addClass: (item: CalendarItem, ...classNames: string[]) => void;
    removeClass: (item: CalendarItem, ...classNames: string[]) => void;
    styles: Ref<{
        [key: number]: string;
    }[]>;
};
