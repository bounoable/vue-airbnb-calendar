import { kebabCase } from 'lodash'

export const cssVar = (name: string) => '--dp-' + kebabCase(name)