<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onBeforeUnmount } from '@vue/composition-api'
// @ts-ignore
import CalendarMonth from './CalendarMonth.vue'
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
import { VNode } from 'vue'

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

export default defineComponent<Props>({
  components: { CalendarMonth },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  } as const,

  setup(props, { root: { $nextTick }, slots }) {
    const options = computed(() => fixOptions(props.options))
    const calendarId = uuid().substr(0, 8)
    const calendar = ref<HTMLElement|null>(null)

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
    } = useCalendarStyle(renderedCalendars as any, visibleCalendars as any)

    const ready = ref(false)

    watch(pickerWidth, (width, oldWidth) => {
      if (!oldWidth && width) {
        ready.value = true
      }
    }, { immediate: true })

    const rootContext = computed<RootContext>(() => ({
      options: options.value as any,
      id: calendarId as any,
      el: calendar.value as any,
      visibleCalendars: visibleCalendars.value as any,
      calendarItemPlugins: calendarItemPlugins.value as any,
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
      destroyFns,
      registerDestroyFn,
    } = usePlugins()

    for (const plugin of props.options.plugins || []) {
      const install = plugin instanceof Function ? plugin : plugin.install
      install.apply(plugin, [rootContext.value, {
        installRootPlugin,
        installCalendarItemPlugin,
      }, registerDestroyFn])
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
      onBeforeUnmount(watch(visibleCalendars as any, watchers.visibleCalendars.bind(options)) as any)
    }

    if (watchers.renderedCalendars) {
      onBeforeUnmount(watch(renderedCalendars as any, watchers.renderedCalendars.bind(options)) as any)
    }

    onBeforeUnmount(() => {
      for (const fn of destroyFns.value) {
        fn()
      }
    })

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
}" tabindex="-1">
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
      <CalendarMonth :context="calendarContexts[i]"/>
    </div>
  </transition-group>
</div>
</template>

<style lang="sass">
/* purgecss start ignore */
.AirbnbCalendar
  @apply relative opacity-0
  @apply outline-none #{!important}

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
  max-width: 100%

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
/* purgecss end ignore */
</style>