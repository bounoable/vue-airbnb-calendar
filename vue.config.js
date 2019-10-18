module.exports = {
  chainWebpack: config => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }
    
    config.externals({
      'date-fns': {
        commonjs: 'date-fns',
        commonjs2: 'date-fns',
        amd: 'dateFns',
      },
      uuid: {
        commonjs: 'uuid',
        commonjs2: 'uuid',
        amd: 'uuid',
      },
      lodash: {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_',
      },
      '@vue/composition-api': {
        commonjs: '@vue/composition-api',
        commonjs2: '@vue/composition-api',
        amd: 'vueCompositionApi',
      },
    })
  }
}
