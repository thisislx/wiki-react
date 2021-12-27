import * as R from 'ramda';
import { isObj } from './isWhat';
import { AF, AO, Key } from './index';

/**
 * @description 数组分类
 * @return object
 */
export const classifyAos = R.curry((prop: AF, arr: AO[]) =>
  arr.reduce((r, o) => {
    const v = prop(o);
    r[v] = r[v] ? [...r[v], o] : [o];
    return r;
  }, {} as AO),
);

/**
 * @description 二维只取数组中某一项（忽略空值）， 输入 undefined | null 取全部值
 */
export const flatArrayShallow = R.curry((index: number | undefined | null, arr: any[]) =>
  arr.reduce((r, c) => {
    const isAll = c == undefined;
    const v = isAll ? c : c?.[index!];
    return v !== undefined ? [...r, ...(isAll && Array.isArray(v) ? v : [v])] : r;
  }, [] as any[]),
);

export const propLength = R.prop('length') as AF;

/**
 * @description 数据内销
 */
export const uniqueWith = R.curry((choose: AF, prop_: string | AF, arr: any[]) => {
  const prop = typeof prop_ === 'function' ? prop_ : (d) => d?.[prop_];
  const arrMap = arr.reduce((map, cur) => {
    const key = cur && typeof cur === 'object' ? prop(cur) : cur;
    map.set(key, map.has(key) ? choose(map.get(key), cur) : cur);
    return map;
  }, new Map());

  return Array.from(arrMap.values());
});

/**
 * @description 优先返回左边，遇到object则合并
 */
export const uniqueLeft = uniqueWith((a, b) => (isObj(a) && isObj(b) ? { ...b, ...a } : a));

/**
 * @description 优先返回右边, 遇到object则合并
 */
export const uniqueRight = uniqueWith((b, a) => (isObj(a) && isObj(b) ? { ...b, ...a } : a));

export const sortByProp: AF = R.curry((prop_: Key, arr: any[]) => {
  const prop = typeof prop_ === 'function' ? prop_ : (v) => v?.[prop_];
  const newArr = [...arr];

  return newArr.sort((a, b) => prop(a) - prop(b));
});

/** @description 更新数组某一项的值 */
export const setArr: AF = R.curry((arr: any[], index: number, newV): any[] =>
  newV === arr[index] ? arr : [...arr.slice(0, index), newV, ...arr.slice(index + 1)],
);

export const arrMove = R.curry((origin: number, target: number, arr: any[]) => [
  ...arr.slice(0, origin),
  ...arr.slice(origin + 1, target + 1),
  arr[origin],
  ...arr.slice(target + 1),
]);

export const arrPropEqual = R.curry((a1: any[], a2: any[]) => {
  if (a1.length !== a2.length) return false;

  for (let i = 0, len = a1.length; i < len; i++)
    if (a1[i] !== a2[i]) {
      return false;
    }

  return true;
});
