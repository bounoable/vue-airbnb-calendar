"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const now = new Date();
function useLocalization(locale, options) {
    const weekdayNames = date_fns_1.eachDayOfInterval({
        start: date_fns_1.startOfWeek(now),
        end: date_fns_1.endOfWeek(now),
    }).map(d => locale.value.localize.day(d.getDay()));
    const weekdaysShort = weekdayNames.map(name => name.substr(0, options.value.shortWeekdaysLength));
    return {
        locale,
        weekdayNames,
        weekdaysShort,
    };
}
exports.default = useLocalization;
