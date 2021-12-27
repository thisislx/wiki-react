import * as R from 'ramda';

export const mergeStr = R.curry((split: string, rest: string[]) =>
  rest.reduce((r, c) => `${r}${split}${c}`),
);
