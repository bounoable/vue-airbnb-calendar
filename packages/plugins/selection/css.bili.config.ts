import { Config } from 'bili'

const config: Config = {
  input: 'src/style.sass',

  output: {
    format: ['cjs'],
  },

  babel: {
    configFile: false,
  }
}

export default config