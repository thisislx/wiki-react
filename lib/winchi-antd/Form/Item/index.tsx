import React from 'react';
import Wc from 'winchi';
import { Form } from 'antd';
import type { Columns } from '../../d';
import { useWcConfig } from '../../hooks';
import styles from './index.less';
import { propFormType } from '../formType';
import { WcResolveChidrenProps } from '../ResolveChidren';

export type WcFormItemProps<T extends AO = AO> = Columns<T> & WcResolveChidrenProps;

type Model = React.FC<WcFormItemProps>;

const WcFormItem_: Model = (props) => {
  const {
    dataIndex,
    title,
    hide,
    formType,
    formItemProps: { width, className = '', style = Wc.obj, ...formItemProps } = Wc.obj,
    formProps = Wc.obj,
  } = props;
  const { wcConfig } = useWcConfig();
  const C = propFormType(formType);

  return (
    <Form.Item
      key={`${dataIndex}`}
      className={`${styles['form-item']} ${styles.grid} ${className}`}
      {...formItemProps}
      name={dataIndex as any}
      label={title}
      style={{
        width,
        ...style,
        display: hide ? 'none' : style?.display,
      }}
    >
      <C
        size={wcConfig.size}
        {...formProps}
        style={{ width: formProps.width, ...(formProps.style || Wc.obj) }}
        column={props}
      />
    </Form.Item>
  );
};

export const WcFormItem = React.memo<Model>(WcFormItem_);
export default WcFormItem
