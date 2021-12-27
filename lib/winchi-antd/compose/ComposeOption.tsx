import React, { useState, useEffect } from 'react';
import type { ComposeComponentProps } from 'winchi/jsx';
import { Spin } from 'antd';
import Wc from 'winchi';

export interface ComposeOptionProps<O = any> extends ComposeComponentProps {
  options?: O[] | AF<any[], Promise<O[]>>;
}

export default (({ options: options_ = Wc.arr, children, ...props }) => {
  const [options, setOptions] = useState<any[]>();

  useEffect(() => {
    const promise = () => Promise.resolve(typeof options_ === 'function' ? options_() : options_);
    promise()?.then(setOptions);
  }, [options_]);

  return <Spin spinning={!options}>{options ? children?.({ ...props, options }) : null}</Spin>;
}) as React.FC<ComposeOptionProps>;
