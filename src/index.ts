// @ts-ignore
import AirbnbCalendarComponent from './components/AirbnbCalendar.vue'
import { VueConstructor } from 'vue'
import * as plugins from './plugins'
export { default as Options } from './options'
export { default as Plugin, PluginFn } from './plugin'
export { default as helpers } from './helpers'
export { RootContext, CalendarContext } from './context'
export { plugins }

const AirbnbCalendar = AirbnbCalendarComponent as VueConstructor

export { AirbnbCalendar }

function install(Vue: VueConstructor, options: {
  name?: string
} = {}) {
  // @ts-ignore
  if (install.installed) return
  // @ts-ignore
  install.installed = true
  Vue.component(options.name || 'AirbnbCalendar', AirbnbCalendar)
}

export const AirbnbCalendarPlugin = {
  install,
}

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
  // @ts-ignore
} else if (typeof global !== 'undefined') {
  // @ts-ignore
	GlobalVue = global.Vue
}

if (GlobalVue) {
	GlobalVue.use({ install })
}
