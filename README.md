**This project is a work in progress and is subject to change. It is very likely that I will change the dependency to Vue 3.x as soon as it's relased.**

# Vue Airbnb Calendar

![Vue Airbnb Calendar](.github/recording.gif)

[Examples](https://bounoable.github.io/vue-airbnb-calendar-examples/)

This calendar / datepicker is inspired by the Datepicker from Airbnb ([react-dates](https://github.com/airbnb/react-dates)) and the existing [vue-airbnb-style-calendar](https://github.com/MikaelEdebro/vue-airbnb-style-datepicker). Unfortunately that project uses 1.x version of [date-fns](https://github.com/date-fns/date-fns), so I couldn't use it in my projects.

This library is created with Vue's [composition API](https://github.com/vuejs/composition-api).
You need to install it to make the calendar work. Learn more about the composition API [here](https://vue-composition-api-rfc.netlify.com/).

```ts
import CompositionApi from '@vue/composition-api'

Vue.use(CompositionApi)
```

## Installation

### Package Manager

```sh
yarn add vue-airbnb-calendar
```

or

```sh
npm install vue-airbnb-calendar --save
```

### CDN

```html
<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/@vue/composition-api/dist/vue-composition-api.umd.js"></script>
<script src="https://unpkg.com/bounoable/vue-airbnb-calendar"></script>
```

## Basic Usage

### Package Manager

```ts
import { AirbnbCalendar, Options } from 'vue-airbnb-calendar'

export default {
  components: { AirbnbCalendar },

  data() {
    const options: Options = {
      // Calendar options...
    }

    return { options }
  }
}
```

```html
<AirbnbCalendar :options="options"/>
```

## Calendar Options

**This project is written in TypeScript, so you can and should discover the available options with your IDE.**

| Property | Type | Default | Description |
| :------- | :--- | :-----: | :---------- |
| dateFnsLocale | Object | english | The date-fns locale object |
| shortWeekdaysLength | Integer | `3` | Number of characters to use for short weekday names |
| maxMonths | Integer | `2` | Maximum number of visible months on the screen |
| startMonth | Date | now | A date which's month is the default leftmost visible calendar month |
| firstMonth | Date | - | The left side limit of the calendar |
| lastMonth | Date | - | The right side limit of the calendar |
| plugins | Array | `[]` | [Calendar plugins](#plugins) |
| watch | Object | - | Watchers for internal properties |

## Plugins

Without any plugins you basically just got an infinite scrolling calendar.
Currently the only available plugin is the Selection Plugin.

## Selection Plugin

The Selection Plugin provides a range datepicker with customizable color schemes and options to control the calendar items/days.

### Supported features:
- Range datepicker
- Custom color scheme
- Disabling of dates (min/max date, date ranges, custom function)
- Highlight dates (custom function)

### Installation

```html
<script>
import { Options, plugins } from 'vue-airbnb-calendar'

export default {
  data() {
    const options: Options = {
      plugins: [
        plugins.SelectionPlugin({
          // Plugin options ...
        })
      ]
    }

    return { options }
  }
}
</script>

<template>
  <AirbnbCalendar :options="options"/>
</template>
```

### Plugin Options

**Like the core, this plugin is written in TypeScript, so you can and should discover the options with your IDE.**

#### Colors

Specify CSS color strings for the different states.

```ts
interface CalendarItemColors {
  background?: string
  border?: string
  text?: string
}
```

| Property | Type | Description |
| :------- | :--- | :---------- |
| colors | Object | Define the colors for the calendar item / day states |
| colors.withinSelection | CalendarItemColors | Day is within selection range / hovered |
| colors.selectable | CalendarItemColors | Day is selectable |
| colors.selected | CalendarItemColors | Day is selected |
| colors.highlighted | CalendarItemColors | Day is highlighted |

#### Other options

| Property | Type | Description |
| :------- | :--- | :---------- |
| dateFormat | String | The date format for the returned dates. If not provided Date objects are returned. |
| minDate | Date | The minimum Date that can be selected. |
| maxDate | Date | The maximum Date that can be selected. |
| ranges | Array | Date ranges that are selectable. If not provided all days are selectable. |
| selectable | Function | Function to determine if a day is selectable. |
| highlight | Function | Function to determine if a day is highlighted. |
| onSelect | Function | Function that is called when the selection changes. |

## Contributing

This calendar was created out of a personal need, therefore new features / plugins will likely also emerge from my personal needs. Feel free to create pull requests, but keep in mind that the core of the calendar should stay small and simple. Rather than adding advanced features directly to the core, try to extend the calendar's API (if you need to) and then create the plugin for the feature.

If you can't contribute to the code by yourself, create an issue and hope for the best 😬
