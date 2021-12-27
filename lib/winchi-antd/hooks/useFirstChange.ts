/**
 * @description 阻止第一次自动触发函数
 */

import { useMemo } from 'react';

export default (fn: AF | void, effect: any[], use: boolean = false) => {
  return useMemo(() => {
    let triggered = !use;
    return (...rest) => {
      const res = triggered && fn?.(...rest);
      triggered = true;
      return res;
    };
  }, effect);
};
