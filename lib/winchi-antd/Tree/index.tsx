import React, { useEffect, useState } from 'react';
import type { TreeProps } from 'antd/lib/tree';
import { Tree, Spin } from 'antd';
import styles from './index.less';

export interface WcTreeProps extends Omit<TreeProps, 'treeData'> {
  request?: AF<any[], Promise<any>>;
  onChange?: AF;
  value?: any;
  treeData?: TreeProps['treeData'] | AF<any[], Promise<TreeProps['treeData']>>
}

type Model = React.FC<WcTreeProps>;

const WcTree_: Model = (props) => {
  const {
    request,
    value,
    treeData: treeData_,
    onChange,
    onCheck,
    checkable = true,
    className = '',
    ...restProps
  } = props;
  const [treeData, setTreeData] = useState();

  useEffect(() => {
    const promise = () => Promise.resolve(typeof treeData_ === 'function' ? treeData_() : treeData_)
    promise().then(setTreeData as AF)
  }, [treeData_]);

  const checkHandle: TreeProps['onCheck'] = (keys, ...rest) => {
    onChange?.(keys, ...rest);
    onCheck?.(keys, ...rest);
  };

  return (
    <Spin spinning={!treeData}>
      {
        treeData && (
          <Tree
            className={`${styles.wrap} ${className}`}
            autoExpandParent
            defaultExpandAll
            {...restProps}
            checkable={checkable}
            onCheck={checkHandle}
            treeData={treeData}
            checkedKeys={value}
          />
        )
      }
    </Spin>
  )

};

export const WcTree = React.memo<Model>(WcTree_)
export default WcTree;
