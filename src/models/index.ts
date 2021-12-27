import { default as counter } from './counter'

const models = {
 counter,
}

export type Models = FnInAO<typeof models>
export type ModelKeys = keyof Models


export default () =>
 Object.entries(models).reduce((result, [key, fn]) => {
  result[key] = (fn as AF)()
  return result
 }, {} as Models)

