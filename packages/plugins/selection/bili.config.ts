import { Config } from 'bili'

const config: Config = {
  input: 'src/index.ts',

  output: {
    format: ['esm', 'umd', 'umd-min', 'cjs'],
    moduleName: 'vueAirbnbCalendarSelection',
    target: 'browser',
    fileName: (ctx, def) => {
      if (ctx.format.indexOf('umd') > -1) {
        return 'vue-airbnb-calendar-plugin-selection[min].[format].js'
      }

      return def
    }
  },

  externals: ['lodash', 'uuid', 'date-fns', 'vue', '@vue/composition-api', 'resize-observer-polyfill', 'vue-airbnb-calendar'],

  env: {
    NODE_ENV: 'production',
  },

  plugins: {
    commonjs: true,
    typescript2: true,
  },

  bundleNodeModules: true,

  babel: {
    configFile: false,
  }
}

export default config
