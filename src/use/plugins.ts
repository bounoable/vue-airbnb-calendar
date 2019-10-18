import { ref } from '@vue/composition-api'
import { CalendarItemPlugin, RootPlugin } from '../plugin'

export default function usePlugins() {
  const rootPlugins = ref<RootPlugin[]>([])
  const calendarItemPlugins = ref<CalendarItemPlugin[]>([])
  const installRootPlugin = (plugin: RootPlugin) => rootPlugins.value.push(plugin)
  const installCalendarItemPlugin = (plugin: CalendarItemPlugin) => calendarItemPlugins.value.push(plugin)

  return {
    rootPlugins,
    calendarItemPlugins,
    installRootPlugin,
    installCalendarItemPlugin,
  }
}