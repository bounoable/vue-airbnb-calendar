import { CalendarItemPlugin, RootPlugin } from '../plugin';
export default function usePlugins(): {
    rootPlugins: import("@vue/composition-api").Ref<RootPlugin[]>;
    calendarItemPlugins: import("@vue/composition-api").Ref<CalendarItemPlugin[]>;
    installRootPlugin: (plugin: RootPlugin) => number;
    installCalendarItemPlugin: (plugin: CalendarItemPlugin) => number;
    destroyFns: import("@vue/composition-api").Ref<(() => any)[]>;
    registerDestroyFn: (fn: () => any) => any;
};
