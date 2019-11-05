"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
exports.normalizeRanges = (ranges) => {
    if (!ranges) {
        return [];
    }
    return (ranges instanceof Function ? ranges() : ranges).map((r) => ({
        start: date_fns_1.startOfDay(r.start),
        end: date_fns_1.startOfDay(r.end),
    }));
};
exports.intervalOverlapsWith = (interval, ranges) => {
    if (!ranges) {
        return;
    }
    ranges = exports.normalizeRanges(ranges);
    if (!(ranges.length && interval.start && interval.end)) {
        return false;
    }
    const selectionInterval = exports.orderedInterval(interval.start, interval.end);
    for (const range of ranges) {
        if (date_fns_1.areIntervalsOverlapping(selectionInterval, range)) {
            return true;
        }
    }
    return false;
};
exports.orderedInterval = (date1, date2) => {
    const start = date_fns_1.isBefore(date1, date2) ? date1 : date2;
    const end = date1 === start ? date2 : date1;
    return { start, end };
};
exports.findRangesOfItem = (item, ranges) => {
    return exports.findRangesOfDate(item.date, ranges);
};
exports.findRangesOfDate = (date, ranges) => {
    if (!ranges) {
        return [];
    }
    ranges = exports.normalizeRanges(ranges);
    return ranges.filter(range => date_fns_1.isWithinInterval(date, range));
};
