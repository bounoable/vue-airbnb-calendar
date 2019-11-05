import { Ref } from '@vue/composition-api';
import { Locale } from 'date-fns';
export interface Options {
    /**
     * The date-fns locale to use. Defauls to english.
     */
    dateFnsLocale: Locale;
    /**
     * The number of character used for the shortened weekdays.
     */
    shortWeekdaysLength: number;
}
export default function useLocalization(locale: Ref<Locale>, options: Ref<Options>): {
    locale: Ref<{
        formatDistance: Function;
        formatRelative: Function;
        localize: {
            ordinalNumber: Function;
            era: Function;
            quarter: Function;
            month: Function;
            day: Function;
            dayPeriod: Function;
        };
        formatLong: Object;
        date: Function;
        time: Function;
        dateTime: Function;
        match: {
            ordinalNumber: Function;
            era: Function;
            quarter: Function;
            month: Function;
            day: Function;
            dayPeriod: Function;
        };
        options?: {
            weekStartsOn?: 0 | 2 | 1 | 6 | 5 | 4 | 3 | undefined;
            firstWeekContainsDate?: 2 | 1 | 7 | 6 | 5 | 4 | 3 | undefined;
        } | undefined;
    }>;
    weekdayNames: string[];
    weekdaysShort: string[];
};
