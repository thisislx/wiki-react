import * as R from 'ramda'
import { fork } from './func'


export const sliceFileName = R.curry(
  (startPath: string, name: string) => {
    const keyArr = name.split(startPath)[startPath ? 1 : 0].split('.')
    const keyArrLength = keyArr.length - 1
    return [keyArr.slice(0, keyArrLength).join(''), keyArr.slice(keyArrLength)]
  }
)

export const getFileName = R.curry(
  (startPath: string, name: string) => R.compose(
    R.slice(0, 1),
    sliceFileName(startPath),
  )(name)
)

/**
 * @returns Record<removeSuffix(fileName), value>
 */
export const readFile = (prefiex: string, context: AF, paths: string[]) =>
  paths
    .map(fork(
      (key, value) => [key, value],
      getFileName(prefiex),
      (v)=> context(v).default,
    ))
    .reduce((result, [key, value]) => {
      result[key] = value
      return result
    }, {} as AF)

