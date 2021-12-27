import * as R from 'ramda';
import { AO, AF, GetKey } from './index';
import { isObj } from './isWhat';

export const prop: AF = R.curry((key: GetKey, o: AO) =>
  typeof key === 'function' ? key(o) : o?.[key as any],
);

export const deepProp = R.curry((keys: GetKey[], o: AO) =>
  keys.reduce((cur, k) => prop(k, cur), o),
);

export const rename = R.curry((key, renameKey, obj) => {
  const val = obj[key];
  const newO = R.assoc(renameKey, val)(obj);
  Reflect.deleteProperty(newO, key);
  return newO;
});

/**
 * 转换数字下标的Record
 */
export const objToArr = (obj: Record<number, any>) =>
  Object.keys(obj)
    .filter((key) => Number.isInteger(+key))
    .reduce((result, cur) => {
      result[cur] = obj[cur]
      return result;
    }, [] as any[]);

export const mergeDeepWith = R.curry((f: AF, o1: AO, o2: AO) => {
  const mergeO = Array.isArray(o1) && Array.isArray(o2) ? [...o1, ...o2] : { ...o1, ...o2 };

  Reflect.ownKeys(mergeO).forEach((key) => {
    if (!Reflect.has(o1, key) || !Reflect.has(o2, key)) return;
    const v1 = Reflect.get(o1, key);
    const v2 = Reflect.get(o2, key);
    Reflect.set(mergeO, key, isObj(v1) && isObj(v2) ? mergeDeepWith(f, v1, v2) : f(v1, v2));
  });

  return mergeO;
});

const _mergeLeftHelper = (a, b) => (Array.isArray(a) && Array.isArray(b) ? [...a, ...b] : a);

const _mergeRightHelper = R.flip(_mergeLeftHelper);
/**
 * @description  {a: undefined  null}, {a: 0} => {a: 0}
 * @type Array [...left, ...rigth]
 */
export const mergeLeft = mergeDeepWith(_mergeLeftHelper);
export const mergeDeepLeft = mergeDeepWith(_mergeLeftHelper);

/**
 * @description {a: 0}, {a: undefined  null} => {a: 0}
 * @type Array [...rigth, ...left]
 */
export const mergeRight = mergeDeepWith(_mergeRightHelper);
export const mergeDeepRight = mergeDeepWith(_mergeRightHelper);
