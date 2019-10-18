<script lang="ts">
import { createComponent, ref, computed } from '@vue/composition-api'
import AirbnbCalendar from '../src/components/AirbnbCalendar.vue'
import Options from '../src/options'
import SelectionPlugin from '../src/plugins/selection/index'
import { subDays, addDays, subMonths, addMonths, isSaturday, isWednesday, isMonday, isTuesday } from 'date-fns'
import de from 'date-fns/locale/de'

export default createComponent({
  components: { AirbnbCalendar },

  setup(props, ctx) {
    const options = computed<Partial<Options>>(() => ({
      maxMonths: 8,
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
        SelectionPlugin({
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

          dateFormat: 'dd-MM-yyyy',
          // ranges: [
          //   {
          //     start: new Date(),
          //     end: addDays(new Date(), 12),
          //   }
          // ],

          // selectable(item, state) {
          //   return false
          // },

          // highlight(item, { selectable }) {
          //   return selectable && isSaturday(item.date)
          // },

          onSelect(selection) {
            console.log(selection)
          },
        }),
      ],
    }))

    return {
      options,
    }
  }
})
</script>

<template>
<div id="app">
  <div class="flex justify-center items-start h-screen p-4 lg:pt-64">
    <div class="border w-full max-w-2xl">
      <AirbnbCalendar :options="options"/>
    </div>
  </div>
</div>
</template>