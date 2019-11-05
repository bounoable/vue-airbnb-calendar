"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const date_fns_1 = require("date-fns");
const makeDateInfo = () => ({
    reservation: false,
    checkIn: false,
    checkOut: false,
});
exports.getInfo = (date, analysis) => analysis[date.getTime()] || (analysis[date.getTime()] = makeDateInfo());
exports.analyzeOptions = (options) => {
    if (!options) {
        return {};
    }
    const analysis = {};
    const reservationOptions = options.reservations || {};
    const reservationRanges = helpers_1.normalizeRanges(reservationOptions.ranges);
    for (const range of reservationRanges) {
        const dates = date_fns_1.eachDayOfInterval(range);
        for (let i = 0; i < dates.length; ++i) {
            const date = dates[i];
            const dateInfo = exports.getInfo(date, analysis);
            dateInfo.reservation = true;
            if (i === 0) {
                dateInfo.checkIn = true;
            }
            if (i === (dates.length - 1)) {
                dateInfo.checkOut = true;
            }
        }
    }
    return analysis;
};
