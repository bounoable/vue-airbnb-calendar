import { CreateElement } from 'vue';

export const renderDay = (h: CreateElement, path: string) => h('div', {
  staticClass: 'AirbnbCalendarItem__checkInOut',
}, [
  h('svg', {
    class: 'AirbnbCalendarItem__checkInOut-svg',
    attrs: {
      viewBox: '0 0 100 100',
      preserveAspectRatio: 'none',
      'shape-rendering': 'geometricPrecision',
    },
  }, [
    h('path', {
      attrs: {
        d: path,
      }
    })
  ])
])

export const renderCheckInDay = (h: CreateElement) => renderDay(h, 'M-1 101 L 101 101 L 101 -1 L -1 101')
export const renderCheckOutDay = (h: CreateElement) => renderDay(h, 'M-1 -1 L 101 -1 L -1 101 L -1 -1')