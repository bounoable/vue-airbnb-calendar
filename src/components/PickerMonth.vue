<script lang="ts">
import { createComponent, computed, ref, onMounted } from '@vue/composition-api'
import { eachDayOfInterval, endOfMonth, subMonths, addMonths, parse as parseDate, format as formatDate } from 'date-fns'
import { Calendar } from '../compose/calendar'
import dateFnsEnUs from 'date-fns/locale/en-US'
import useLocalization from '../compose/localization'
import Options from '../options'
import useCalendarItems, { CalendarItem } from '../compose/calendar-items'
import useCalendarItemStyle from '../compose/calendar-item-style'
import { CalendarContext } from '../context'

interface Props {
  context: CalendarContext
}

export default createComponent<Props>({
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
      classes: calendarItemClasses,
      addClass,
      removeClass,
      styles: calendarItemStyles,
    } = useCalendarItemStyle(calendarItems, computed(() => props.context))

    const isVisible = computed(() => {
      return props.context.visibleCalendars.indexOf(props.context.calendar) > -1
    })

    const calendarItemRefs = ref<HTMLTableCellElement[]>(null)

    onMounted(() => {
      for (const plugin of props.context.calendarItemPlugins) {
        for (const event in plugin.on || {}) {
          const eventKey = event as keyof HTMLElementEventMap

          for (const itemRef of calendarItemRefs.value || []) {
            const index = parseInt(itemRef.dataset.num!, 10)
            const item = calendarItems.value[index]

            itemRef.addEventListener(eventKey, function(ev) {
              plugin.on![eventKey]!(item, this, ev as any, {
                addClass: (...classNames: string[]) => addClass(item, ...classNames),
                removeClass: (...classNames: string[]) => removeClass(item, ...classNames),
              }, props.context)
            })
          }
        }
      }
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
    }
  }
})
</script>

<template>
<div class="PickerMonth" :class="{
  'is-visible': isVisible,
}">
  <p class="PickerMonthHeading">
    {{ formatDate(firstOfMonth, 'MMMM yyyy', { locale: context.options.dateFnsLocale }) }}
  </p>

  <table class="PickerMonthTable" @mouseleave="hoverItem = null">
    <thead>
      <tr>
        <th v-for="weekday of weekdaysShort" :key="weekday" v-text="weekday"></th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, r) of calendarRows" :key="r">
        <td v-for="(item, c) of row.items" :key="c">
          <div
            ref="calendarItemRefs"
            :data-num="r * 7 + c"
            class="CalendarItem"
            :class="calendarItemClasses[r * 7 + c]"
            :style="calendarItemStyles[r * 7 + c]"
          >
            <span v-if="item.isCurrentMonth" class="CalendarItem__day">
              {{ formatDate(item.date, 'd') }}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<style lang="sass" scoped>
.PickerMonth
  @apply p-4

  &.is-visible
    .PickerMonthHeading
      @apply opacity-100

.PickerMonthHeading
  @apply text-xl font-semibold text-center tracking-tight text-gray-700 py-1 mb-2 select-none opacity-0
  transition: opacity 0.35s

.PickerMonthTable
  @apply w-full table-fixed border-collapse border-none

  th
    @apply border-none font-normal text-sm py-2 text-gray-600
  
  td
    @apply p-0
  
.CalendarItem
  @apply text-center font-light -ml-px -mt-px
  padding-top: 0.4rem
  padding-bottom: 0.4rem

  &.is-bordered
    @apply border

.CalendarItem__day
  @apply text-gray-700 text-sm
</style>