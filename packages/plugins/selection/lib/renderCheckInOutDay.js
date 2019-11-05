"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDay = (h, path) => h('div', {
    staticClass: 'AirbnbCalendarItem__checkInOut',
}, [
    h('svg', {
        class: 'AirbnbCalendarItem__checkInOut-svg',
        attrs: {
            viewBox: '0 0 100 100',
            preserveAspectRatio: 'none',
            'shape-rendering': 'geometricPrecision',
        },
    }, [
        h('path', {
            attrs: {
                d: path,
            }
        })
    ])
]);
exports.renderCheckInDay = (h) => exports.renderDay(h, 'M-1 101 L 101 101 L 101 -1 L -1 101');
exports.renderCheckOutDay = (h) => exports.renderDay(h, 'M-1 -1 L 101 -1 L -1 101 L -1 -1');
