"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_api_1 = require("@vue/composition-api");
const date_fns_1 = require("date-fns");
exports.default = composition_api_1.createComponent({
    props: {
        item: Object,
        renderFns: Array,
        classes: {},
        styles: {},
    },
    render(h) {
        const p = this;
        let vnode = h('div', {
            class: p.classes,
            style: p.styles,
        }, [
            h('span', {
                class: 'AirbnbCalendarItem__day',
            }, date_fns_1.format(p.item.date, 'd'))
        ]);
        for (const renderFn of p.renderFns) {
            vnode = renderFn(h, vnode, {
                item: p.item,
                classes: p.classes,
            });
        }
        return vnode;
    },
});
