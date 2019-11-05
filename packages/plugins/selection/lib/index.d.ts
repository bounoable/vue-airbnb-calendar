import { Ref } from '@vue/composition-api';
import Options from './options';
declare const _default: <F extends string | undefined = undefined>(opt?: Options<F> | Ref<Options<F>>) => (context: import("vue-airbnb-calendar/lib/context").RootContext, helpers: {
    installRootPlugin(plugin: import("vue-airbnb-calendar/lib/plugin").RootPlugin): void;
    installCalendarItemPlugin(plugin: import("vue-airbnb-calendar/lib/plugin").CalendarItemPlugin): void;
}, onDestroy: (destroyFn: () => any) => void) => any;
export default _default;
export { Options };
