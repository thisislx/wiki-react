import React, { useEffect, useState } from 'react';
import type { TreeSelectProps } from 'antd/lib/tree-select';
import { Spin, TreeSelect } from 'antd';
import type { FormComponentProps } from '../../d';
import styles from './index.less';

export type TreeData = Exclude<TreeSelectProps<any>['treeData'], void>;

export interface WcTreeSelectProps
  extends Omit<TreeSelectProps<any>, 'treeData' | 'onChange'>,
    FormComponentProps {
  treeData: TreeData | AF<any[], Promise<TreeData>> | void;
}

type Model = React.FC<WcTreeSelectProps>;

const WcTreeSelect_: Model = ({
  value: value_,
  onChange,
  treeData: treeData_,
  className = '',
  ...props
}) => {
  const [value, setValue] = useState();
  const [treeData, setTreeData] = useState<TreeData>();

  useEffect(() => {
    const f = typeof value_ === 'function' ? value_ : () => Promise.resolve(value_);
    f().then((v) => v && setValue(v));
  }, [value_]);

  useEffect(() => {
    const promise = typeof treeData_ === 'function' ? treeData_ : () => Promise.resolve(treeData_);
    promise().then(setTreeData as AF);
  }, [treeData_]);

  return (
    <Spin spinning={!treeData}>
      {treeData && (
        <TreeSelect
          autoFocus
          treeDefaultExpandedKeys={treeData.map((d) => d.key) as any[]}
          treeCheckable
          allowClear
          showCheckedStrategy={TreeSelect.SHOW_CHILD}
          value={value}
          onChange={onChange}
          className={`${styles.wrap} ${className}`}
          treeData={treeData}
          {...props}
        ></TreeSelect>
      )}
    </Spin>
  );
};

export const WcTreeSelect = React.memo<Model>(WcTreeSelect_);
export default WcTreeSelect;
