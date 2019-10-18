<script lang="ts">
import { createComponent, ref, computed, onMounted, watch } from '@vue/composition-api'
import PickerMonth from './PickerMonth.vue'
import Dictionary from '../dictionary'
import useCalendar, { Calendar } from '../use/calendar'
import useCalendarStyle from '../use/calendar-style'
import Options, { InternalOptions } from '../options'
import { CalendarItem } from '../use/calendar-items'
// @ts-ignore
import { v4 as uuid } from 'uuid'
import dateFnsEnUs from 'date-fns/locale/en-US'
import Plugin, { PluginFn } from '../plugin'
import usePlugins from '../use/plugins'
import { RootContext, CalendarContext } from '../context'

interface Props {
  options: Partial<Options>
}

const now = new Date()

const fixOptions = (options: Options): InternalOptions => {
  return {
    maxMonths: 2,
    dateFnsLocale: dateFnsEnUs,
    shortWeekdaysLength: 3,
    ...options,
  }
}

export default createComponent<Props>({
  components: { PickerMonth },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  } as const,

  setup(props, { root: { $nextTick } }) {
    const options = computed(() => fixOptions(props.options))
    const calendarId = uuid().substr(0, 8)
    const calendar = ref<HTMLElement>(null)

    const {
      startCalendar,
      endCalendar,
      visibleCalendars,
      renderedCalendars,
      shiftStartCalendar,
      reachedMin,
      reachedMax,
      pickerWidth,
    } = useCalendar(calendar, options)

    const {
      monthStyles,
    } = useCalendarStyle(renderedCalendars, visibleCalendars)

    const ready = ref(false)

    watch(pickerWidth, (width, oldWidth) => {
      if (!oldWidth && width) {
        ready.value = true
      }
    })

    const rootContext = computed<RootContext>(() => ({
      options: options.value,
      id: calendarId.value,
      el: calendar.value,
      visibleCalendars: visibleCalendars.value,
      calendarItemPlugins: calendarItemPlugins.value,
    }))

    const calendarContexts = computed<CalendarContext[]>(() => {
      return renderedCalendars.value.map(calendar => ({
        ...rootContext.value,
        calendar,
      }))
    })

    const {
      rootPlugins,
      calendarItemPlugins,
      installRootPlugin,
      installCalendarItemPlugin,
    } = usePlugins()

    for (const plugin of props.options.plugins || []) {
      const install = plugin instanceof Function ? plugin : plugin.install
      install.apply(plugin, [rootContext.value, {
        installRootPlugin,
        installCalendarItemPlugin,
      }])
    }

    onMounted(() => {
      for (const plugin of rootPlugins.value) {
        for (const event in plugin.on || {}) {
          const eventKey = event as keyof HTMLElementEventMap

          calendar.value!.addEventListener(eventKey, function(ev) {
            plugin.on![eventKey]!(this, ev as any, rootContext.value)
          })
        }
      }
    })

    const watchers = props.options.watch || {}

    if (watchers.visibleCalendars) {
      watch(visibleCalendars, watchers.visibleCalendars.bind(options))
    }

    if (watchers.renderedCalendars) {
      watch(renderedCalendars, watchers.renderedCalendars.bind(options))
    }

    return {
      calendarContexts,
      calendarId,
      calendar,
      startCalendar,
      endCalendar,
      visibleCalendars,
      renderedCalendars,
      shiftStartCalendar,
      monthStyles,
      reachedMin,
      reachedMax,
      ready,
    }
  }
})
</script>

<template>
<div ref="calendar" class="AirbnbCalendar" :class="{
  'is-ready': ready,
}">
  <transition name="AirbnbCalendar__cursor-transition">
    <button v-if="!reachedMin" class="AirbnbCalendar__cursor is-left" @click="shiftStartCalendar(0, -1)">
      <svg viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z" class="AirbnbCalendar__cursor-arrow"></path></svg>
    </button>
  </transition>

  <transition name="AirbnbCalendar__cursor-transition">
    <button v-if="!reachedMax" class="AirbnbCalendar__cursor is-right" @click="shiftStartCalendar(0, 1)">
      <svg viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z" class="AirbnbCalendar__cursor-arrow"></path></svg>
    </button>
  </transition>

  <transition-group tag="div" class="AirbnbCalendar__months" ref="monthRefs" :name="ready ? 'AirbnbCalendar__month-transition' : ''">
    <div v-for="(calendar, i) of renderedCalendars"
      :key="calendar.year + '-' + calendar.month"
      :style="monthStyles[calendar.year][calendar.month]"
      class="AirbnbCalendar__month-wrapper"
    >
      <PickerMonth :context="calendarContexts[i]"/>
    </div>
  </transition-group>
</div>
</template>

<style lang="sass">
.AirbnbCalendar
  @apply relative opacity-0

  &.is-ready
    @apply opacity-100

.AirbnbCalendar__cursor
  @apply absolute top-0 m-4 outline-none border text-sm rounded-sm w-12 h-10 p-2 z-10 bg-white
  transition: all 0.15s

  &:focus
    @apply outline-none

  @media screen and (min-width: 1024px)
    &:hover
      @apply bg-gray-100
    
    &:active
      @apply bg-gray-200
  
  &.is-left
    @apply left-0
  
  &.is-right
    @apply right-0

  &-arrow
    fill: #4a5568

  svg
    @apply w-full h-full

.AirbnbCalendar__months
  @apply relative flex overflow-hidden

.AirbnbCalendar__month-wrapper
  @apply top-0

.AirbnbCalendar__month-transition
  &-move
    transition: all 0.35s

.AirbnbCalendar__cursor-transition
  &-enter-active,
  &-leave-active
    transition: all 0.25s
  
  &-enter
    @apply opacity-0
    &-to
      @apply opacity-100
  
  &-leave
    @apply opacity-100
    &-to
      @apply opacity-0
</style>