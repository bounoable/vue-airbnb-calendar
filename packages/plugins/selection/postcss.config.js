module.exports = {
  plugins: [
    require('tailwindcss')('../../core/tailwind.config.js'),
    require('autoprefixer')(),
    require('cssnano')({
      preset: 'default',
    }),
  ]
}