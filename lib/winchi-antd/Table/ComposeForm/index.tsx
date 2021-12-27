import React, { useEffect, useState } from 'react';
import { ComposTableProps } from '../d';
import Wc from 'winchi';
import * as R from 'ramda';
import styles from './index.less';

export interface ComposeFormProps<T extends AO = AO> extends ComposTableProps<T> {
  onChange?(v, ks?): any;
  value?: any;
}

type Model = React.FC<ComposeFormProps>;

const ComposeForm_: Model = ({
  onChange,
  value = Wc.arr,
  style = Wc.obj,
  rowSelection,
  className = '',
  children,
  queryProps,
  ...props
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState(value);
  const wrapSetSelectedRows = _paramIsArr(setSelectedRowKeys);

  useEffect(() => {
    if (!Wc.arrPropEqual(value, selectedRowKeys)) wrapSetSelectedRows(value);
  }, [value]);

  const childrenProps: ComposTableProps = {
    className: `${styles.wrap} ${className}`,
    scroll: { x: undefined, y: undefined },
    style: { padding: 0, ...style },
    rowSelection: {
      ...(rowSelection ?? Wc.obj),
      selectedRowKeys,
      onChange: (...rest) => {
        onChange?.(rest[0], rest[1]);
        setSelectedRowKeys(rest[0]);
        return rowSelection?.onChange?.(...rest);
      },
    },
    queryProps: {
      pageSize: 10,
      ...(queryProps ?? Wc.obj),
    },
    ...props,
  };

  return children?.(childrenProps);
};

export const ComposeForm = React.memo<Model>(ComposeForm_);
export default ComposeForm;

const _paramIsArr = R.curry((f, arr) => f(Array.isArray(arr) ? arr : [arr]));
