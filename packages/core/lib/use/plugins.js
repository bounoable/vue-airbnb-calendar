"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_api_1 = require("@vue/composition-api");
function usePlugins() {
    const rootPlugins = composition_api_1.ref([]);
    const calendarItemPlugins = composition_api_1.ref([]);
    const installRootPlugin = (plugin) => rootPlugins.value.push(plugin);
    const installCalendarItemPlugin = (plugin) => calendarItemPlugins.value.push(plugin);
    const destroyFns = composition_api_1.ref([]);
    const registerDestroyFn = (fn) => destroyFns.value.push(fn);
    return {
        rootPlugins,
        calendarItemPlugins,
        installRootPlugin,
        installCalendarItemPlugin,
        destroyFns,
        registerDestroyFn,
    };
}
exports.default = usePlugins;
