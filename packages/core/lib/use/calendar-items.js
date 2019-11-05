"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_api_1 = require("@vue/composition-api");
const date_fns_1 = require("date-fns");
function useCalendarItems(calendar) {
    const firstOfMonth = composition_api_1.computed(() => {
        return new Date(calendar.value.year, calendar.value.month, 1, 0, 0, 0, 0);
    });
    const lastOfMonth = composition_api_1.computed(() => {
        return date_fns_1.endOfMonth(firstOfMonth.value);
    });
    const currentMonthDates = composition_api_1.computed(() => {
        return date_fns_1.eachDayOfInterval({
            start: firstOfMonth.value,
            end: lastOfMonth.value,
        });
    });
    const prevMonthDates = composition_api_1.computed(() => {
        return date_fns_1.eachDayOfInterval({
            start: date_fns_1.subMonths(firstOfMonth.value, 1),
            end: new Date(firstOfMonth.value.getFullYear(), firstOfMonth.value.getMonth(), 0),
        });
    });
    const nextMonthDates = composition_api_1.computed(() => {
        return date_fns_1.eachDayOfInterval({
            start: date_fns_1.addMonths(firstOfMonth.value, 1),
            end: date_fns_1.addMonths(lastOfMonth.value, 1),
        });
    });
    const calendarItems = composition_api_1.computed(() => {
        const items = [];
        const firstOfMonthDay = firstOfMonth.value.getDay();
        for (let i = 0; i < firstOfMonthDay; ++i) {
            const date = prevMonthDates.value[prevMonthDates.value.length - (firstOfMonthDay - i)];
            items.push({
                date,
                isCurrentMonth: false,
            });
        }
        for (const date of currentMonthDates.value) {
            items.push({
                date,
                isCurrentMonth: true,
            });
        }
        let remaining = 7 - (items.length % 7);
        for (let i = 0; i < remaining; ++i) {
            const date = nextMonthDates.value[i];
            items.push({
                date,
                isCurrentMonth: false,
            });
        }
        return items;
    });
    const calendarRows = composition_api_1.computed(() => {
        const count = Math.ceil(calendarItems.value.length / 7);
        const rows = [];
        for (let i = 0; i < count; ++i) {
            const items = [];
            for (let c = i * 7; c < ((i + 1) * 7); ++c) {
                items.push(calendarItems.value[c]);
            }
            rows.push({
                items,
            });
        }
        return rows;
    });
    return {
        firstOfMonth,
        lastOfMonth,
        currentMonthDates,
        prevMonthDates,
        nextMonthDates,
        calendarItems,
        calendarRows,
    };
}
exports.default = useCalendarItems;
