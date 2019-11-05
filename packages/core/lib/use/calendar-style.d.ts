import { Ref } from '@vue/composition-api';
import { Calendar } from './calendar';
export interface MonthPosition {
    left?: string | number;
    right?: string | number;
}
export interface MonthStyle extends MonthPosition {
    width?: CSSStyleDeclaration['width'];
    position?: CSSStyleDeclaration['position'];
    transform?: CSSStyleDeclaration['transform'];
    opacity?: CSSStyleDeclaration['opacity'];
    zIndex?: CSSStyleDeclaration['zIndex'];
}
export default function useCalendarStyle(renderedCalendars: Ref<Calendar[]>, visibleCalendars: Ref<Calendar[]>): {
    monthStyles: Ref<{
        [key: number]: {
            [key: number]: MonthStyle;
        };
    }>;
};
