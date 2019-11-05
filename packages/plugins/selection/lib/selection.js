"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_api_1 = require("@vue/composition-api");
const date_fns_1 = require("date-fns");
const helpers_1 = require("./helpers");
const reservations_1 = require("./reservations");
const analysis_1 = require("./analysis");
const containers = {};
exports.selectItem = (item, selection) => {
    if (selection.value.from && selection.value.to) {
        selection.value = {
            from: item,
            to: null,
        };
        return;
    }
    if (!selection.value.from) {
        selection.value.from = item;
        return;
    }
    let from = selection.value.from;
    let to = item;
    if (date_fns_1.isBefore(to.date, from.date)) {
        to = from;
        from = item;
    }
    selection.value = { from, to };
};
exports.clear = (selection) => {
    selection.value.from = null;
    selection.value.to = null;
};
exports.selectionWrapsRanges = (selection, ranges) => {
    if (!ranges) {
        return;
    }
    if (!(selection.from && selection.to)) {
        return false;
    }
    return helpers_1.intervalOverlapsWith({ start: selection.from.date, end: selection.to.date }, ranges);
};
const isBeforeMinDate = (item, minDate) => {
    return !!minDate && date_fns_1.isBefore(item.date, minDate);
};
const isAfterMaxDate = (item, maxDate) => {
    return !!maxDate && date_fns_1.isAfter(item.date, maxDate);
};
function useSelection(id, options) {
    const { selection, hoverItem, analysis, } = containers[id] || (containers[id] = {
        selection: composition_api_1.ref({
            from: null,
            to: null,
        }),
        hoverItem: composition_api_1.ref(null),
        analysis: composition_api_1.ref({}),
    });
    const isHovered = (item) => !!hoverItem.value && item.date.getTime() === hoverItem.value.date.getTime();
    const isSelected = (item) => {
        return !!((selection.value.from && selection.value.from.date.getTime() === item.date.getTime())
            || (selection.value.to && selection.value.to.date.getTime() === item.date.getTime()));
    };
    const isWithinSelection = (item) => {
        if (!item.isCurrentMonth) {
            return false;
        }
        const hoverSelection = {
            from: selection.value.from || hoverItem.value,
            to: selection.value.to || hoverItem.value,
        };
        if (hoverSelection.from && hoverSelection.to && date_fns_1.isAfter(hoverSelection.from.date, hoverSelection.to.date)) {
            const from = hoverSelection.from;
            const to = hoverSelection.to;
            hoverSelection.from = to;
            hoverSelection.to = from;
        }
        return !!(hoverSelection.from
            && hoverSelection.to
            && date_fns_1.isWithinInterval(item.date, {
                start: hoverSelection.from.date,
                end: hoverSelection.to.date,
            }));
    };
    const isSelectable = (item, analysis, options) => {
        if (!item.isCurrentMonth) {
            return false;
        }
        const resOptions = options.reservations || {};
        const minDays = resOptions.minDays instanceof Function
            ? resOptions.minDays({ selection: selection.value })
            : resOptions.minDays || 0;
        const reservationRanges = helpers_1.normalizeRanges(resOptions.ranges || []);
        const selectableRanges = helpers_1.findRangesOfItem(item, options.selectableRanges);
        const beforeMinDate = isBeforeMinDate(item, options.minDate);
        const afterMaxDate = isAfterMaxDate(item, options.maxDate);
        const validCheckInOut = reservations_1.validateCheckInOut(selection.value, item, analysis, reservationRanges, minDays, options);
        const defaultValue = !((options.selectableRanges && !selectableRanges.length) ||
            !validCheckInOut ||
            beforeMinDate || afterMaxDate);
        if (options.selectable) {
            return options.selectable(item, {
                selectableRanges,
                reservationRanges,
                beforeMinDate,
                afterMaxDate,
                defaultValue,
                selection: selection.value,
            });
        }
        return defaultValue;
    };
    const stopHandles = composition_api_1.ref([]);
    stopHandles.value.push(composition_api_1.watch(options, options => {
        analysis.value = analysis_1.analyzeOptions(options);
    }));
    const destroy = () => {
        for (const stop of stopHandles.value) {
            stop();
        }
    };
    return {
        selection,
        selectItem: exports.selectItem,
        hoverItem,
        analysis,
        isHovered,
        clear: exports.clear,
        isSelectable,
        isSelected,
        isWithinSelection,
        analyzeOptions: analysis_1.analyzeOptions,
        hasReservation: reservations_1.hasReservation,
        isBeforeMinDate,
        isAfterMaxDate,
        stopHandles,
        destroy,
    };
}
exports.default = useSelection;
