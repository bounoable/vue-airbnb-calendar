<script lang="ts">
import { createComponent, computed, ref, onMounted, onBeforeMount, onBeforeUnmount, Ref } from '@vue/composition-api'
import { eachDayOfInterval, endOfMonth, subMonths, addMonths, parse as parseDate, format as formatDate } from 'date-fns'
import { Calendar } from '../use/calendar'
import dateFnsEnUs from 'date-fns/locale/en-US'
import useLocalization from '../use/localization'
import Options from '../options'
import useCalendarItems, { CalendarItem } from '../use/calendar-items'
import useCalendarItemStyle from '../use/calendar-item-style'
import { CalendarContext } from '../context'
import Dictionary from '../dictionary'
import RenderCalendarItem from './RenderCalendarItem'

interface Props {
  context: CalendarContext
}

export default createComponent<Props>({
  components: { RenderCalendarItem },
  props: {
    context: Object,
  } as const,

  setup(props, ctx) {
    const {
      weekdaysShort,
    } = useLocalization(
      computed(() => props.context.options.dateFnsLocale || dateFnsEnUs),
      computed(() => props.context.options),
    )

    const {
      firstOfMonth,
      lastOfMonth,
      currentMonthDates,
      prevMonthDates,
      nextMonthDates,
      calendarItems,
      calendarRows,
    } = useCalendarItems(computed(() => props.context.calendar))

    const {
      addClass,
      removeClass,
      styles: calendarItemStyles,
      classes: calendarItemClasses,
    } = useCalendarItemStyle(calendarItems, computed(() => props.context))

    const isVisible = computed(() => {
      return props.context.visibleCalendars.indexOf(props.context.calendar) > -1
    })

    const calendarItemRefs = ref<any[]>(null)

    const calendarItemEventListeners = ref<{
      el: HTMLElement
      event: string
      listener: any
    }[]>([])

    onMounted(() => {
      if (!props.context.calendarItemPlugins.length) {
        return
      }

      for (const itemRef of calendarItemRefs.value || []) {
        const el = itemRef.$el as HTMLElement
        const index = parseInt(el.dataset.num!, 10)
        const item = calendarItems.value[index]

        for (const plugin of props.context.calendarItemPlugins) {
          for (const event in plugin.on || {}) {
            const eventKey = event as keyof HTMLElementEventMap
            function listener(this: HTMLElement, ev: Event) {
              plugin.on![eventKey]!(item, this, ev as any, {
                addClass: (...classNames: string[]) => addClass(item, ...classNames),
                removeClass: (...classNames: string[]) => removeClass(item, ...classNames),
              }, props.context)
            }

            el.addEventListener(eventKey, listener)

            calendarItemEventListeners.value.push({
              el,
              listener,
              event: eventKey,
            })
          }
        }
      }
    })

    onBeforeUnmount(() => {
      for (const { el, event, listener } of calendarItemEventListeners.value) {
        el.removeEventListener(event, listener)
      }
    })

    const calendarItemRenderFns = computed(() => {
      return props.context.calendarItemPlugins
        .map(plugin => plugin.calendarItemRenderFn)
        .filter(renderFn => !!renderFn)
    })

    return {
      firstOfMonth,
      formatDate,
      weekdaysShort,
      calendarRows,
      calendarItemClasses,
      calendarItemStyles,
      isVisible,
      calendarItemRefs,
      calendarItemRenderFns,
    }
  }
})
</script>

<template>
<div class="AirbnbCalendarMonth" :class="{
  'is-visible': isVisible,
}">
  <p class="AirbnbCalendarMonth__heading">
    {{ formatDate(firstOfMonth, 'MMMM yyyy', { locale: context.options.dateFnsLocale }) }}
  </p>

  <div class="AirbnbCalendarMonth__calendar" @mouseleave="hoverItem = null">
    <div class="AirbnbCalendarMonth__week">
      <div class="AirbnbCalendarMonth__cell is-heading" v-for="weekday of weekdaysShort" :key="weekday" v-text="weekday"></div>
    </div>

    <div v-for="(row, r) of calendarRows" :key="r" class="AirbnbCalendarMonth__week">
      <div v-for="(item, c) of row.items" :key="r * 7 + c" class="AirbnbCalendarMonth__cell">
        <RenderCalendarItem
          ref="calendarItemRefs"
          :data-num="r * 7 + c" v-if="item.isCurrentMonth"
          :item="item"
          :classes="calendarItemClasses[r * 7 + c]"
          :styles="calendarItemStyles[r * 7 + c]"
          :render-fns="calendarItemRenderFns"
        />
      </div>
    </div>
  </div>
</div>
</template>

<style lang="sass">
/* purgecss start ignore */
.AirbnbCalendarMonth
  @apply p-4

  &.is-visible
    .AirbnbCalendarMonth__heading
      @apply opacity-100

.AirbnbCalendarMonth__heading
  @apply text-xl font-semibold text-center tracking-tight text-gray-700 py-1 mb-2 select-none opacity-0
  transition: opacity 0.35s

.AirbnbCalendarMonth__calendar
  @apply w-full table table-fixed

.AirbnbCalendarMonth__week
  @apply table-row

.AirbnbCalendarMonth__cell
  @apply p-0 table-cell
  width: calc(100% / 7)

  &.is-heading
    @apply border-none font-normal text-sm py-2 text-gray-600 text-center
  
.AirbnbCalendarItem
  @apply text-center font-light -ml-px -mt-px bg-white border border-transparent

  &.is-current-month
    @apply border-gray-300

.AirbnbCalendarItem__day
  @apply text-gray-700 text-sm block
  padding-top: 0.4rem
  padding-bottom: 0.4rem
/* purgecss end ignore */
</style>