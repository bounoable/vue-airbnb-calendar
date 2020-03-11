<script lang="ts">
import { createComponent, ref, computed, onMounted } from '@vue/composition-api'
import { AirbnbCalendar } from '../src/index'
import Options from '../src/options'
import { subDays, addDays, subMonths, addMonths, isSaturday, isWednesday, isMonday, isTuesday, differenceInDays, getDay } from 'date-fns'
import de from 'date-fns/locale/de'

export default createComponent({
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
    <div class="mx-auto" style="width: 900px">
      <button class="mb-10 border rounded bg-gray-100 px-4 py-2 text-gray-700 font-medium focus:outline-none lg:hover:bg-gray-200" @click="active = !active">Toggle</button>

      <div v-if="active" class="border">
        <AirbnbCalendar :options="options"/>
      </div>
    </div>
  </div>
</div>
</template>