declare module '*.less';

declare type AO = Record<string, any>;
declare type AF<P extends any[] = any[], R = any> = (...p: P) => R;
declare type Key = string | number;
declare type GetKey = Key | AF<any[], Key>;
