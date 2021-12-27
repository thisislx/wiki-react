import * as R from 'ramda';

export const computePercent = R.curry(
  (validBit: number, total: number, cur: number) =>
    `${(cur / total) * 100 || 0}`.slice(0, validBit + 2) + '%',
);

export const polling = R.curry((r1: number, r2: number, slide: number) => {
  const len = Math.abs(r1 - r2) + 1;
  const start = Math.min(r1, r2);
  const offset = (((slide - start) % len) + len) % len;
  return offset + start;
});
