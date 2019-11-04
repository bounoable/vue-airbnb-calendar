import Dictionary from '../../../src/dictionary'
import Options, { DateFormat } from './options'
import { normalizeRanges } from './helpers'
import { eachDayOfInterval } from 'date-fns'

export interface StaticDateInfo {
  reservation: boolean
  checkIn: boolean
  checkOut: boolean
}

export type Analysis = Dictionary<StaticDateInfo, number> // number = Date.getTime()

const makeDateInfo = (): StaticDateInfo => ({
  reservation: false,
  checkIn: false,
  checkOut: false,
})

export const getInfo = (date: Date, analysis: Analysis) => analysis[date.getTime()] || (analysis[date.getTime()] = makeDateInfo())

export const analyzeOptions = <F extends DateFormat>(options?: Options<F>): Analysis => {
  if (!options) {
    return {}
  }

  const analysis: Analysis = {}
  
  const reservationOptions = options.reservations || {}
  const reservationRanges = normalizeRanges(reservationOptions.ranges)

  for (const range of reservationRanges) {
    const dates = eachDayOfInterval(range)

    for (let i = 0; i < dates.length; ++i) {
      const date = dates[i]
      const dateInfo = getInfo(date, analysis)

      dateInfo.reservation = true
      
      if (i === 0) {
        dateInfo.checkIn = true
      }

      if (i === (dates.length - 1)) {
        dateInfo.checkOut = true
      }
    }
  }

  return analysis
}