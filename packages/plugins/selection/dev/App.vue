<script lang="ts">
import { defineComponent, ref, computed, onMounted } from '@vue/composition-api'
import { AirbnbCalendar } from 'vue-airbnb-calendar'
import Options from '../../../core/src/options'
import SelectionPlugin from '../src'
import SelectionOptions from '../src/options'
import { subDays, addDays, subMonths, addMonths, isSaturday, isWednesday, isMonday, isTuesday, differenceInDays, getDay, isBefore } from 'date-fns'
import de from 'date-fns/locale/de'
import 'vue-airbnb-calendar/dist/style.css'
import '../src/style.sass'

const today = new Date()

export default defineComponent({
  components: { AirbnbCalendar },

  setup(props, ctx) {
    const options = computed<Partial<Options>>(() => ({
      maxMonths: 24,
      // dateFnsLocale: de,
      // shortWeekdaysLength: 2,
      // startMonth: addMonths(new Date(), 3),
      // lastMonth: addMonths(new Date(), 4),
      // firstMonth: subDays(new Date(), 17),
      // lastMonth: addDays(new Date(), 0),
      // watch: {
      //   visibleCalendars(calendars) {
      //     console.log(calendars)
      //   },
      //   renderedCalendars(calendars) {
      //     console.log(calendars)
      //   }
      // },
      plugins: [
        SelectionPlugin(computed<SelectionOptions>(() => ({
          // minDate: subDays(new Date(), 7),
          // maxDate: addDays(new Date(), 20),
          colors: {
            highlighted: {
              background: '#f0fff4',
              border: '#9ae6b4',
            },
            withinSelection: {
              background: '#ebf8ff',
              border: '#90cdf4',
            },
            selectable: {
              background: '#f0fff4',
              border: '#9ae6b4',
            },
            unselectable: {
            },
            selected: {
              background: '#bee3f8',
              border: '#90cdf4'
            },
          },
          css: {
            base: {
              fontWeight: '400',
            },
            selected: {
              fontWeight: '600',
            },
          },
          // dateFormat: 'dd-MM-yyyy',
          // ranges: [
          //   {
          //     start: new Date(),
          //     end: addDays(new Date(), 12),
          //   }
          // ],
          // selectable(item, state) {
          //   return false
          // },

          // highlight(item, state) {
          //   return state.selectable && isSaturday(item.date)
          // },

          // selectableRanges: [
          //   {
          //     start: new Date(2020, 0, 1),
          //     end: new Date(2020, 11, 30),
          //   },
          // ],
          // selectableWeekdays: [6],
          reservations: {
            ranges: [
              {
                start: addDays(new Date(), 4),
                end: addDays(new Date(), 12),
              },
              {
                start: addDays(new Date(), 13),
                end: addDays(new Date(), 36),
              },
              {
                start: addDays(new Date(), 40),
                end: addDays(new Date(), 56),
              },
              {
                start: new Date(2020, 2, 20),
                end: new Date(2020, 2, 29),
              },
            ],
            allowCheckInOutOverlap: true,
            allowGapFills: true,
            minDays: 7,
            maxGap: 0,
          },
          selectableWeekdays: [3],
          selectable(item, { defaultValue }) {
            if (!defaultValue) {
              return false
            }

            if (isBefore(item.date, today)) {
              return false
            }

            return true
          },
          // highlight(item, { selectable }) {
          //   return selectable && isSaturday(item.date)
          // },
          // selectable(item, { selection, defaultValue }) {
          //   if (!defaultValue) {
          //     return false
          //   }
          //   if (selection.from && selection.to) {
          //     return isSaturday(item.date)
          //   }
          //   if (selection.from && !selection.to) {
          //     return defaultValue
          //   }
          //   return isSaturday(item.date)
          // },
          onSelect(selection) {
            console.log(selection)
          },
        }))),
      ],
    }))
    const active = ref(true)
    return {
      options,
      active,
    }
  }
})
</script>

<template>
<div id="app">
  <div class="flex justify-center items-start h-screen p-4 lg:pt-64">
    <div class="container">
      <button class="mb-10 border rounded bg-gray-100 px-4 py-2 text-gray-700 font-medium focus:outline-none lg:hover:bg-gray-200" @click="active = !active">Toggle</button>

      <div v-if="active" class="border container">
        <AirbnbCalendar :options="options"/>
      </div>
    </div>
  </div>
</div>
</template>