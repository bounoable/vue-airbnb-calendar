"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const composition_api_1 = require("@vue/composition-api");
const date_fns_1 = require("date-fns");
const lodash_1 = require("lodash");
const resize_observer_polyfill_1 = tslib_1.__importDefault(require("resize-observer-polyfill"));
function useCalendar(picker, options) {
    const pickerWidth = composition_api_1.ref(0);
    const roHandler = lodash_1.debounce((entries) => {
        for (const entry of entries) {
            const target = entry.target;
            pickerWidth.value = target.clientWidth;
        }
    }, 250, { leading: false });
    const ResizeObserver = (typeof window !== 'undefined'
        ? (window.ResizeObserver || resize_observer_polyfill_1.default)
        : resize_observer_polyfill_1.default);
    const ro = new ResizeObserver(roHandler);
    composition_api_1.watch(picker, (picker, oldPicker) => {
        if (!oldPicker && picker) {
            ro.observe(picker);
        }
    });
    const now = new Date();
    const startCalendar = composition_api_1.ref({
        year: (options.value.startMonth || now).getFullYear(),
        month: (options.value.startMonth || now).getMonth(),
    });
    const maxVisibleCalendars = composition_api_1.computed(() => {
        const calendars = [startCalendar.value];
        for (let i = 1; i < options.value.maxMonths; ++i) {
            const calendar = shiftCalendar(startCalendar.value, 0, i);
            if (options.value.lastMonth && (calendar.year > options.value.lastMonth.getFullYear() || (calendar.year >= options.value.lastMonth.getFullYear() &&
                calendar.month > options.value.lastMonth.getMonth()))) {
                continue;
            }
            calendars[i] = calendar;
        }
        return calendars;
    });
    const visibleCalendars = composition_api_1.computed(() => {
        let count = maxVisibleCalendars.value.length;
        count = 1 + Math.round((pickerWidth.value - 300) / (350));
        count = count <= 0 ? 1 : count;
        count = count > maxVisibleCalendars.value.length ? maxVisibleCalendars.value.length : count;
        return maxVisibleCalendars.value.slice(0, count);
    });
    const endCalendar = composition_api_1.computed(() => visibleCalendars.value[visibleCalendars.value.length - 1]);
    const renderedCalendars = composition_api_1.computed(() => {
        const calendars = visibleCalendars.value.slice();
        if (!calendars.length) {
            return calendars;
        }
        calendars.unshift(shiftCalendar(calendars[0], 0, -1));
        calendars.push(shiftCalendar(calendars[calendars.length - 1], 0, 1));
        return calendars;
    });
    const moduloFix = (num, max = 12) => (num % max + max) % max;
    const shiftCalendar = (calendar, years, months) => {
        calendar = {
            year: calendar.year,
            month: calendar.month,
        };
        let year = calendar.year + years;
        const month = calendar.month + months;
        if (month < 0) {
            year--;
        }
        else if (month > 11) {
            year++;
        }
        calendar.year = year;
        calendar.month = moduloFix(month);
        return calendar;
    };
    const reachedMin = composition_api_1.computed(() => {
        if (!options.value.firstMonth) {
            return false;
        }
        const prevCalendar = shiftCalendar(startCalendar.value, 0, -1);
        return isBeforeFirstMonth(prevCalendar.year, prevCalendar.month);
    });
    const reachedMax = composition_api_1.computed(() => {
        if (!options.value.lastMonth) {
            return false;
        }
        const nextCalendar = shiftCalendar(visibleCalendars.value[visibleCalendars.value.length - 1], 0, 1);
        return isAfterLastMonth(nextCalendar.year, nextCalendar.month);
    });
    const isBeforeFirstMonth = (year, month) => {
        if (!options.value.firstMonth) {
            return false;
        }
        return year < options.value.firstMonth.getFullYear()
            || (year <= options.value.firstMonth.getFullYear() && month < options.value.firstMonth.getMonth());
    };
    const isAfterLastMonth = (year, month) => {
        if (!options.value.lastMonth) {
            return false;
        }
        return year > options.value.lastMonth.getFullYear()
            || (year >= options.value.lastMonth.getFullYear() && month > options.value.lastMonth.getMonth());
    };
    const shiftStartCalendar = (years, months) => {
        const sumMonths = 12 * years + months;
        const calendar = shiftCalendar(startCalendar.value, years, months);
        if (isBeforeFirstMonth(calendar.year, calendar.month) || isAfterLastMonth(calendar.year, calendar.month)) {
            return;
        }
        if (sumMonths < 0 && reachedMin.value) {
            calendar.year = options.value.firstMonth.getFullYear();
            calendar.month = options.value.firstMonth.getMonth();
        }
        if (sumMonths > 0 && reachedMax.value) {
            const max = date_fns_1.subMonths(options.value.lastMonth, options.value.maxMonths - 1);
            calendar.year = max.getFullYear();
            calendar.month = max.getMonth();
        }
        startCalendar.value = calendar;
    };
    return {
        pickerWidth,
        startCalendar,
        endCalendar,
        visibleCalendars,
        renderedCalendars,
        shiftCalendar,
        shiftStartCalendar,
        moduloFix,
        reachedMin,
        reachedMax
    };
}
exports.default = useCalendar;
