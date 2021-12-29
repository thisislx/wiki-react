import * as R from 'ramda';
import { AO, AF, GetKey } from './index';
import { isExtendObj, isObj } from './isWhat';

export const prop: AF = R.curry((key: GetKey, o: AO) =>
  typeof key === 'function' ? key(o) : o?.[key as any],
);

export const deepProp = R.curry((keys: GetKey[], o: AO) =>
  keys.reduce((cur, k) => prop(k, cur), o),
);


/** 重塑对象的某个属性的值，这个值受限于对象或者数组(deep) */
export const propJudgeObject = R.curry(
  (key: string, handle: AF<[AO], any>, target: AO) => isExtendObj(target[key]) ? ({
    ...target,
    [key]: Array.isArray(target[key])
      ? target[key].map(R.compose(
        handle,
        propJudgeObject(key, handle),
      ))
      : handle(target[key])
  }) : target
)

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


/** 更换对象的属性名字 */
export const propRename = R.curry(
  (map: AO, target: AO) => Reflect.ownKeys(target).reduce((result, key: any) => ({
    ...result,
    [map[key] ?? key]: Reflect.get(target, key),
  }), {} as AO)
)

/** propRename的deep版本，如处理path = children */
export const deepPropRename = R.curry(
  (path: string, map: AO, target: AO) => R.compose(
    propJudgeObject(path, propRename(map)),
    propRename(map)
  )(target)
)