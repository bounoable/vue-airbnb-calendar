"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_api_1 = require("@vue/composition-api");
function useCalendarItemStyle(items, context) {
    const pluginClasses = composition_api_1.ref([]);
    const classes = composition_api_1.computed(() => {
        return items.value.map((item, i) => {
            let classes = ['AirbnbCalendarItem'];
            if (item.isCurrentMonth) {
                classes.push('is-current-month');
            }
            for (const plugin of context.value.calendarItemPlugins) {
                if (plugin.classes) {
                    classes.push(...plugin.classes.apply(plugin, [item, context.value]));
                }
            }
            for (const name of pluginClasses.value[i] || []) {
                classes.push(name);
            }
            return classes;
        });
    });
    const addClass = (item, ...classNames) => {
        const index = items.value.indexOf(item);
        if (index === -1) {
            return;
        }
        pluginClasses.value[index] = pluginClasses.value[index] || [];
        for (const name of classNames) {
            if (pluginClasses.value[index].indexOf(name) === -1) {
                pluginClasses.value[index].push(name);
            }
        }
    };
    const removeClass = (item, ...classNames) => {
        const index = items.value.indexOf(item);
        if (index === -1) {
            return;
        }
        pluginClasses.value[index] = pluginClasses.value[index] || [];
        for (const name of classNames) {
            const nameIndex = pluginClasses.value[index].indexOf(name);
            if (nameIndex === -1) {
                continue;
            }
            pluginClasses.value[index].splice(nameIndex, 1);
        }
    };
    const styles = composition_api_1.computed(() => {
        return items.value.map((item, i) => {
            let styles = {};
            for (const plugin of context.value.calendarItemPlugins) {
                if (plugin.styles) {
                    styles = Object.assign(Object.assign({}, styles), plugin.styles.apply(plugin, [item, classes.value[i] || [], context.value]));
                }
            }
            return styles;
        });
    });
    return {
        classes,
        addClass,
        removeClass,
        styles,
    };
}
exports.default = useCalendarItemStyle;
