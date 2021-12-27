export const asyncCompose = (...fns: AF[]) => async (data?) => {
 let result = data
 for (let k = fns.length - 1; k >= 0; k--) {
  result = await fns[k](result)
 }
 return result
}

export const alt = (f1: AF, f2: AF) => (val?: any) => f1(val) || f2(val)
export const and = (f1: AF, f2: AF) => (val?: any) => f1(val) && f2(val)

export const tab: AF = (...fns: AF[]) => (val: any) => {
 fns.forEach(fn => fn(val))
 return val
}
export const sep = (...fns: AF[]) => v => fns.forEach(fn => fn(v))
export const fork = (join: AF, f1: AF, f2: AF) =>
 v => join(f1(v), f2(v))
