import React, { createContext, useContext, useState } from 'react';
import { WcConfig } from './d';
import Wc from 'winchi';

export const defaultVal: {
  wcConfig: WcConfig;
  setWcConfig(c: Partial<WcConfig>): any;
} = {
  wcConfig: {
    size: 'middle',
    modalWidth: 500,
    queryProps: {
      startCurrent: 1,
      pageSize: 20,
      propData: 'records',
      propTotal: 'total',
      requestPageKey: 'current',
      requestPageSizeKey: 'pageSize',
      request: () => Promise.reject('ComposeQuery request(): 没有传递request，但是调用了'),
      composeRequest: (f, p) => f?.(p),
    },
  },
  setWcConfig: Wc.func,
};

export const WcContext = createContext<typeof defaultVal>(defaultVal);

export interface WcProviderProps {
  defaultValues?: Partial<WcConfig>;
}

export const WcProvider: React.FC<WcProviderProps> = ({ children, defaultValues }) => {
  const [config, setConfig] = useState<WcConfig>({
    size: defaultValues?.size ?? defaultVal.wcConfig.size,
    modalWidth: defaultValues?.modalWidth ?? defaultVal.wcConfig.modalWidth,
    queryProps: {
      ...defaultVal?.wcConfig.queryProps,
      ...(defaultValues?.queryProps ?? Wc.obj),
    },
  });

  const value: typeof defaultVal = {
    wcConfig: config,
    setWcConfig(newV) {
      setConfig((old) => ({ ...old, ...newV }));
    },
  };

  return <WcContext.Provider value={value}>{children}</WcContext.Provider>;
};

/**
 * @description HOC Component
 */
export const UseWcConfigRender: React.FC<{
  children: (value: typeof defaultVal) => React.ReactNode;
}> = ({ children }) => {
  const wcConfig = useContext(WcContext);
  return <>{children?.(wcConfig)}</>;
};
