import { Config } from 'bili'

const config: Config = {
  input: ['src/components/AirbnbCalendar.vue', 'src/components/CalendarMonth.vue'],

  output: {
    format: ['esm'],
    dir: 'dist/components',
    fileName() {
      return '[name][min].vue[ext]'
    },
  },

  plugins: {
    vue: true,
    typescript2: true,
  },
}

export default config