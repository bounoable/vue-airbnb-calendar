"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const date_fns_1 = require("date-fns");
const composition_api_1 = require("@vue/composition-api");
const styles_1 = require("vue-airbnb-calendar/lib/helpers/styles");
const selection_1 = tslib_1.__importDefault(require("./selection"));
const helpers_1 = require("./helpers");
const renderCheckInOutDay_1 = require("./renderCheckInOutDay");
exports.default = (opt = {}) => {
    const options = composition_api_1.isRef(opt) ? opt : composition_api_1.ref(opt);
    return (rootContext, { installRootPlugin, installCalendarItemPlugin }, onDestroy) => {
        const { selection, hoverItem, isHovered, selectItem, isSelectable, isSelected, isWithinSelection, isBeforeMinDate, isAfterMaxDate, analysis, hasReservation, stopHandles, destroy, clear: clearSelection, } = selection_1.default(rootContext.id, options);
        onDestroy(destroy);
        composition_api_1.onMounted(() => {
            stopHandles.value.push(composition_api_1.watch(() => options.value.colors, colors => {
                for (const state in colors) {
                    const stateColors = colors[state];
                    for (const key in stateColors) {
                        const color = stateColors[key];
                        document.documentElement.style.setProperty(styles_1.cssVar(`sel-color-${state}-${key}`), color);
                    }
                }
            }));
        });
        stopHandles.value.push(composition_api_1.watch(selection, sel => {
            if ((sel.from || sel.to) && options.value.onSelect) {
                // @ts-ignore
                let from = sel.from
                    ? (typeof options.value.dateFormat === 'undefined' ? sel.from.date : date_fns_1.format(sel.from.date, options.value.dateFormat))
                    : null;
                // @ts-ignore
                let to = sel.to
                    ? (typeof options.value.dateFormat === 'undefined' ? sel.to.date : date_fns_1.format(sel.to.date, options.value.dateFormat))
                    : null;
                options.value.onSelect.apply(options, [{
                        from,
                        to,
                    }]);
            }
        }, { deep: true }));
        installRootPlugin({
            on: {
                keyup(el, ev) {
                    if (ev.key === 'Escape') {
                        clearSelection(selection);
                    }
                }
            },
        });
        installCalendarItemPlugin({
            classes(item) {
                const classes = [];
                if (!item.isCurrentMonth) {
                    return classes;
                }
                const selectable = isSelectable(item, analysis.value, options.value);
                const blocked = hasReservation(item, analysis.value);
                const hovered = isHovered(item);
                const withinSelection = isWithinSelection(item);
                const selected = isSelected(item);
                const highlighted = options.value.highlight ? options.value.highlight(item, {
                    hovered,
                    selectable,
                    selected,
                    withinSelection,
                    blocked,
                }) : false;
                let blockedStartDay = false;
                let blockedEndDay = false;
                if (options.value.reservations && options.value.reservations.allowCheckInOutOverlap) {
                    const blockedRanges = helpers_1.findRangesOfItem(item, options.value.reservations ? options.value.reservations.ranges : undefined);
                    for (const range of blockedRanges) {
                        if (date_fns_1.isSameDay(range.start, item.date)) {
                            blockedStartDay = true;
                        }
                        if (date_fns_1.isSameDay(range.end, item.date)) {
                            blockedEndDay = true;
                        }
                    }
                }
                if (selectable) {
                    classes.push('is-selectable');
                }
                else {
                    classes.push('is-unselectable');
                }
                if (hovered) {
                    classes.push('is-hovered');
                }
                if (withinSelection) {
                    classes.push('is-within-selection');
                }
                if (selected) {
                    classes.push('is-selected');
                }
                if (highlighted) {
                    classes.push('is-highlighted');
                }
                if (blocked) {
                    classes.push('is-blocked');
                }
                if (!(blockedStartDay && blockedEndDay)) {
                    if (blockedStartDay) {
                        classes.push('is-blocked-start-day');
                    }
                    if (blockedEndDay) {
                        classes.push('is-blocked-end-day');
                    }
                }
                return classes;
            },
            styles(item, classes, ctx) {
                let styles = {};
                if (!options.value.css) {
                    return styles;
                }
                if (options.value.css.base) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.base);
                }
                if (options.value.css.selectable && classes.indexOf('is-selectable') > -1) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.selectable);
                }
                if (options.value.css.unselectable && classes.indexOf('is-unselectable') > -1) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.unselectable);
                }
                if (options.value.css.hovered && classes.indexOf('is-hovered') > -1) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.hovered);
                }
                if (options.value.css.withinSelection && classes.indexOf('is-within-selection') > -1) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.withinSelection);
                }
                if (options.value.css.selected && classes.indexOf('is-selected') > -1) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.selected);
                }
                if (options.value.css.highlighted && classes.indexOf('is-highlighted') > -1) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.highlighted);
                }
                if (options.value.css.blocked && classes.indexOf('is-blocked') > -1) {
                    styles = Object.assign(Object.assign({}, styles), options.value.css.blocked);
                }
                return styles;
            },
            on: {
                click(item) {
                    if (isSelectable(item, analysis.value, options.value)) {
                        selectItem(item, selection);
                    }
                },
                mouseenter(item) {
                    if (!item.isCurrentMonth || isBeforeMinDate(item, options.value.minDate) || isAfterMaxDate(item, options.value.maxDate)) {
                        hoverItem.value = null;
                        return;
                    }
                    hoverItem.value = item;
                },
                mouseleave(item) {
                    if (hoverItem.value === item) {
                        hoverItem.value = null;
                    }
                },
            },
            calendarItemRenderFn(h, prev, { classes }) {
                if (!(options.value.reservations && options.value.reservations.allowCheckInOutOverlap)) {
                    return prev;
                }
                if (classes.indexOf('is-hovered') > -1 || classes.indexOf('is-selected') > -1) {
                    return prev;
                }
                if (classes.indexOf('is-blocked-start-day') > -1) {
                    prev.children.unshift(renderCheckInOutDay_1.renderCheckInDay(h));
                }
                if (classes.indexOf('is-blocked-end-day') > -1) {
                    prev.children.unshift(renderCheckInOutDay_1.renderCheckOutDay(h));
                }
                return prev;
            }
        });
    };
};
