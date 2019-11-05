"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_api_1 = require("@vue/composition-api");
function useCalendarStyle(renderedCalendars, visibleCalendars) {
    const monthStyles = composition_api_1.computed(() => {
        const styles = {};
        for (let i = 0; i < renderedCalendars.value.length; ++i) {
            const widthPercentage = 100 / visibleCalendars.value.length;
            let style = {};
            if (visibleCalendars.value.indexOf(renderedCalendars.value[i]) > -1) {
                style.position = 'static';
            }
            else {
                style.position = 'absolute';
                style.width = widthPercentage + '%';
                style.left = (-widthPercentage + (i * widthPercentage)) + '%';
            }
            styles[renderedCalendars.value[i].year] = styles[renderedCalendars.value[i].year] || {};
            styles[renderedCalendars.value[i].year][renderedCalendars.value[i].month] = style;
        }
        return styles;
    });
    return {
        monthStyles,
    };
}
exports.default = useCalendarStyle;
