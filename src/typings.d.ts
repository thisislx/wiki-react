declare module 'slash2'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

declare type NODE_ENV = 'production' | 'development'

declare type AO = Record<any, any>
declare type AF<P = any[], R = any> = (...rest: P) => R

declare interface QueryPagination {
  current?: number
  pageSize?: number
}

declare type FnInAO<V extends Record<string, AF>> = {
  [K in keyof V]: ReturnType<V[K]>
}


