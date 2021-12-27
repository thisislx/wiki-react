import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Space } from 'antd';
import Wc, { R } from 'winchi';
import type { Columns, ColumnFormListProps } from '../../d';
import ResolveChidren, { WcResolveChidrenProps } from '../ResolveChidren';
import { filterFormColumns, WcFormContext } from '../';
import { processEnum, dynamicForm } from '../../utils';
import styles from './index.less';

export interface WcFormListProps<T extends AO = AO>
  extends Columns<T>,
    Omit<WcResolveChidrenProps, 'enum'> {
  addFiledName?: string;
}

type Model = React.FC<WcFormListProps>;

const FormList_: Model = ({
  className = '',
  formListProps: formListProps_ = Wc.obj,
  dataIndex,
  hide,
  addFiledName,
  title,
}) => {
  const { onValuesChange } = useContext(WcFormContext);
  const { columns_, width, ...formListProps } = useMemo(() => {
    const { columns, width, ...formListProps } = formListProps_ as ColumnFormListProps;
    return {
      columns_: columns,
      width,
      formListProps,
    };
  }, [formListProps_]);

  const [columns, setColumns] = useState<Columns[]>(columns_);

  const queryColumnEnum = processEnum((c, index) => {
    setColumns((old) => [...old.slice(0, index), c, ...old.slice(index + 1)]);
  });

  useEffect(
    R.compose(
      () =>
        onValuesChange(dataIndex, (changeValue) =>
          setColumns((old) => dynamicForm(old, changeValue)),
        ),
      R.addIndex(R.forEach)(queryColumnEnum),
      filterFormColumns,
      Wc.idendify(columns_),
    ),
    [columns_, dataIndex],
  );

  return (
    <div className={`${styles.list} ${className}`} style={{ width }}>
      <div className="ant-form-item-label">
        <label htmlFor={`${dataIndex}`}>{title}</label>
      </div>
      <main>
        <Form.List name={`${dataIndex}`} {...formListProps}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((filed, index) => (
                <Space key={filed.key} className={styles.space} align="center">
                  {columns?.map((c) => {
                    const dataIndex = [filed.name, c.dataIndex] as any;
                    return (
                      <ResolveChidren
                        key={dataIndex.join('-')}
                        {...{ ...c, dataIndex }}
                        formItemProps={{ width: '100%', ...(c.formItemProps || {}), ...filed }}
                      />
                    );
                  })}
                  <MinusCircleOutlined onClick={() => remove(filed.name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  className={styles.add}
                  hidden={hide}
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  {addFiledName}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </main>
    </div>
  );
};

export const FormList = React.memo<Model>(FormList_);
export default FormList;
