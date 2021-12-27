import * as R from 'ramda';
import { AF, AO, ReturnParameters } from './index';

export interface AsyncComposeReturn<D = any> {
  (data?: any): Promise<D>;
  catch(cb: AF): AsyncComposeReturn<D>;
  finally(cb: AF): AsyncComposeReturn<D>;
}

const _LOCKET = Symbol('locking');

export const alt = (f1: AF, f2: AF) => (val?: any) => f1(val) || f2(val);

export const and = (f1: AF, f2: AF) => (val?: any) => f1(val) && f2(val);

export const sep = (...fns: AF[]) => (...rest) => {
  fns.forEach((fn) => fn(...rest));
  return rest.length === 1 ? rest[0] : rest;
};

export const fork = (join: AF, f1: AF, f2: AF) => (v) => join(f1(v), f2(v));

export const idendify: AF = (v) => () => v;

/**
 * @description 等待 callback
 */
export const tap: AF = (fn) => async (...v) => {
  await fn(...v);
  return v.length < 2 ? v[0] : v;
};

export const curryLazy = R.compose(
  R.curry,
  (fn) =>
    new Proxy(fn, {
      apply(target, _, args) {
        return (...rest) => target(...args, ...rest);
      },
    }),
);

export const asyncCompose = <D = any>(...fns: AF[]): AsyncComposeReturn<D> => {
  /** 自底向上 */
  const errCallbacks: AF[] = [];
  /** 自顶向下 */
  const thenCallbacks: AF[] = [...fns];
  const finallyCallbacks: AF[] = [];

  const f: AsyncComposeReturn = async (data?) => {
    try {
      let result = data;
      for (let k = thenCallbacks.length - 1; k >= 0; k--) {
        result = await thenCallbacks[k](result);
      }
      return result;
    } catch (e) {
      const reject = errCallbacks.reduce(
        (promise, cb) => promise.catch(cb),
        Promise.reject<any>(e),
      );
      const d = await reject;
      return d == undefined ? Promise.reject(d) : d;
    } finally {
      finallyCallbacks.forEach((f) => f());
    }
  };

  f.catch = (cb) => {
    errCallbacks.push(cb);
    return f;
  };

  f.finally = (cb) => {
    finallyCallbacks.push(cb);
    return f;
  };

  return f;
};

export const lockWrap = <F extends AF<any[], Promise<any>>>(fn: F) =>
  async function lockFn_(
    ...rest: ReturnParameters<F>
  ): Promise<ReturnType<F> extends any ? ReturnType<F> : Promise<ReturnType<F>>> {
    lockFn_[_LOCKET] = true;
    try {
      const d = await fn(...rest);
      return d;
    } catch (e) {
      console.error(`lockWrap.${fn.name}`, e);
      return Promise.reject(e);
    } finally {
      lockFn_[_LOCKET] = false;
    }
  };

export const callLock = <F extends AF>(fn: F) => (...rest: ReturnParameters<F>): ReturnType<F> => {
  const isLocket = fn[_LOCKET];
  return isLocket ? Promise.reject(`callLock.${fn.name}: 该函数已经在执行了`) : fn(...rest);
};

export const messageComposeMethod = R.curry(
  (compose: AF, record: Record<string, any>, target: AO | any[]) =>
    R.mapObjIndexed((v, k) => (record[k] ? compose(record[k], v) : v), target),
);

export const debounce = R.curry((gap: number, f: AF) => {
  let old = Number.MIN_SAFE_INTEGER;
  return (...params) => {
    const now = Date.now();
    if (now - gap >= old) {
      old = now;
      return f(...params);
    }
  };
});

export const debouncePromise = (rejectValue?) => {
  const queue: AF[] = [];

  return (promise: Promise<any>) => {
    const lastReject = queue[queue.length - 1];
    lastReject?.(rejectValue);
    return Promise.race([
      promise.then((d) => {
        queue.splice(0, queue.length);
        return d;
      }),
      new Promise((_, reject) => queue.push(reject)),
    ]);
  };
};
