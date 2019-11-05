"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const date_fns_1 = require("date-fns");
const analysis_1 = require("./analysis");
exports.hasReservation = (item, analysis) => {
    return !!(analysis && analysis[item.date.getTime()] && analysis[item.date.getTime()].reservation);
};
exports.validateCheckInOut = (selection, item, analysis, reservationRanges, minDays, options) => {
    const resOptions = options.reservations;
    if (!resOptions) {
        return true;
    }
    if (!minDays) {
        return true;
    }
    const maxGap = resOptions.maxGap
        ? (resOptions.maxGap instanceof Function
            ? resOptions.maxGap({ selection })
            : resOptions.maxGap)
        : 0;
    // validate selection start
    if (!(selection.from || selection.to) || (selection.from && selection.to)) {
        // shift dates depending on whether check-in & check-out days can overlap
        const shift = resOptions.allowCheckInOutOverlap ? 0 : 1;
        const isCheckIn = analysis_1.getInfo(date_fns_1.addDays(item.date, shift), analysis).checkIn;
        const isCheckOut = analysis_1.getInfo(date_fns_1.subDays(item.date, shift), analysis).checkOut;
        // always allow check-in and check-out days to be selected if resOptions.allowGapFills is true
        if (resOptions.allowGapFills &&
            isCheckOut != isCheckIn) {
            return true;
        }
        if (isCheckOut &&
            !helpers_1.intervalOverlapsWith({
                start: item.date,
                end: date_fns_1.addDays(item.date, minDays),
            }, reservationRanges)) {
            return true;
        }
        if (isCheckIn &&
            !helpers_1.intervalOverlapsWith({
                start: date_fns_1.subDays(item.date, minDays),
                end: item.date,
            }, reservationRanges)) {
            return true;
        }
        // allow check-in with a maximum gap to another reservation of maxGap
        for (const range of reservationRanges) {
            if (date_fns_1.isBefore(item.date, range.start)) {
                // check if item.date is in the gap zone before a reservation and minDays is would be fulfilled
                if (date_fns_1.differenceInDays(range.start, item.date) <= (maxGap + shift) &&
                    !helpers_1.intervalOverlapsWith({
                        start: date_fns_1.subDays(item.date, minDays),
                        end: item.date,
                    }, reservationRanges)) {
                    return true;
                }
            }
            else if (date_fns_1.isAfter(item.date, range.end)) {
                // check if item.date is in the gap zone after a reservation and minDays is would be fulfilled
                if (date_fns_1.differenceInDays(item.date, range.end) <= (maxGap + shift) &&
                    !helpers_1.intervalOverlapsWith({
                        start: item.date,
                        end: date_fns_1.addDays(item.date, minDays),
                    }, reservationRanges)) {
                    return true;
                }
            }
        }
        // check if minDays would be fulfilled
        if (helpers_1.intervalOverlapsWith({ start: date_fns_1.subDays(item.date, minDays + shift), end: item.date }, reservationRanges) ||
            helpers_1.intervalOverlapsWith({ start: item.date, end: date_fns_1.addDays(item.date, minDays + shift) }, reservationRanges)) {
            return false;
        }
    }
    // validate selection end
    if (selection.from && !selection.to) {
        // shift dates depending on whether check-in & check-out days can overlap
        let shift = resOptions.allowCheckInOutOverlap ? 0 : 1;
        const interval = helpers_1.orderedInterval(selection.from.date, item.date);
        const days = date_fns_1.differenceInDays(interval.end, interval.start);
        // check if selection would wrap a reservation
        if (helpers_1.intervalOverlapsWith(interval, reservationRanges)) {
            return false;
        }
        // allow gap fills
        if (days < minDays && resOptions.allowGapFills) {
            if (date_fns_1.isAfter(item.date, selection.from.date) &&
                analysis_1.getInfo(date_fns_1.addDays(item.date, shift), analysis).checkIn &&
                analysis_1.getInfo(date_fns_1.subDays(selection.from.date, shift), analysis).checkOut) {
                return true;
            }
            else if (date_fns_1.isBefore(item.date, selection.from.date) &&
                analysis_1.getInfo(date_fns_1.subDays(item.date, shift), analysis).checkOut &&
                analysis_1.getInfo(date_fns_1.addDays(selection.from.date, shift), analysis).checkIn) {
                return true;
            }
        }
        const dateInfo = analysis_1.getInfo(item.date, analysis);
        if (days < minDays) {
            return false;
        }
        // always allow seletion to connect to check-in & check-out days
        if (dateInfo.checkIn != dateInfo.checkOut) {
            return true;
        }
        for (const range of reservationRanges) {
            // check if item.date is in the gap zone before or after a reservation and minDays is would be fulfilled
            if ((date_fns_1.isBefore(item.date, range.start) && date_fns_1.differenceInDays(range.start, item.date) <= (maxGap + shift)) ||
                (date_fns_1.isAfter(item.date, range.end) && date_fns_1.differenceInDays(item.date, range.end) <= (maxGap + shift))) {
                return true;
            }
        }
        shift = (resOptions.allowCheckInOutOverlap ? 0 : 2);
        if (date_fns_1.isBefore(item.date, selection.from.date)) {
            if (helpers_1.intervalOverlapsWith({
                start: date_fns_1.subDays(interval.start, minDays + shift),
                end: interval.start,
            }, reservationRanges)) {
                return false;
            }
        }
        if (date_fns_1.isAfter(item.date, selection.from.date)) {
            if (helpers_1.intervalOverlapsWith({
                start: interval.end,
                end: date_fns_1.addDays(interval.end, minDays + shift),
            }, reservationRanges)) {
                return false;
            }
        }
    }
    return true;
};
