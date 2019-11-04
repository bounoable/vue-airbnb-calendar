import { Config } from 'bili'

const config: Config = {
  input: [
    'src/index.ts'
  ],

  output: {
    format: ['umd', 'umd-min', 'cjs'],
    moduleName: 'vueAirbnbCalendar',
    target: 'browser',
    extractCSS: true,
    fileName: (ctx, def) => {
      if (ctx.format.indexOf('umd') > -1) {
        return 'vue-airbnb-calendar[min].[format].js'
      }

      return def
    }
  },

  externals: ['lodash', 'uuid', 'date-fns', 'vue', '@vue/composition-api', 'resize-observer-polyfill'],

  env: {
    NODE_ENV: 'production',
  },

  plugins: {
    commonjs: true,
    vue: true,
    typescript2: true,
  },

  bundleNodeModules: true,

  babel: {
    configFile: false,
  }
}

export default config