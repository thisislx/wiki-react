import React, { useRef, useState } from 'react';
import { Button, Checkbox, Dropdown, Menu, Spin, Tooltip, Divider } from 'antd';
import {
  ColumnHeightOutlined,
  LoadingOutlined,
  SettingOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import Wc from 'winchi';
import { useWcConfig } from 'winchi-antd';
import { ComposTableProps, TableActionRef } from '../d.d';
import styles from './index.less';

type Model = React.FC<ComposTableProps>;

const _controlProps: ComposTableProps['controlProps'] = {
  refresh: true,
  density: true,
  setting: false,
};

const ComposeControl_: Model = ({ children, controlProps, ...props_ }) => {
  if (!controlProps) return children?.(props_);

  const {
    wcConfig: { queryProps: defaultQueryProps = Wc.obj, size = 'middle' },
    setWcConfig,
  } = useWcConfig();

  const { pagination, columns, queryProps, rowSelection: rowSelection_, ...props } = props_;

  const { onLoading, actionRef: actionRef_ } = queryProps ?? defaultQueryProps!;

  const {
    className = '',
    title,
    renderContent,
    setting = _controlProps.setting,
    refresh = _controlProps.refresh,
    density = _controlProps.density,
    Rights,
  } = controlProps ?? _controlProps;
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>(Wc.arr);
  const selectedRowsRef = useRef<any[]>();
  const actionRef = useRef<TableActionRef>();

  const loadingHandle = (b: boolean) => {
    onLoading?.(b);
    setLoading(b);
  };

  const refreshTable = () => {
    actionRef.current?.reloadAndClearHistory
      ? actionRef.current.reloadAndClearHistory()
      : actionRef.current?.reload?.();
  };

  const effectSelectedRows: AF = (ks = Wc.arr, rows = Wc.arr) => {
    selectedRowsRef.current = rows;
    setSelectedRowKeys(ks);
    rowSelection_?.onChange?.(ks, rows);
  };

  const composeRequest = async (f, params) => {
    const value = await (queryProps?.composeRequest
      ? queryProps.composeRequest(f, params)
      : f?.(params));
    effectSelectedRows();
    return value;
  };

  const rowSelection: ComposTableProps['rowSelection'] =
    rowSelection_ !== false
      ? {
        selectedRowKeys,
        ...rowSelection_,
        onChange: effectSelectedRows,
      }
      : undefined;

  const columnHeightMenuJSX = (
    <Menu
      onClick={Wc.sep(({ key }) => setWcConfig({ size: key }))}
      selectedKeys={[size]}
      className={styles['menu-min-width']}
    >
      {['small', 'middle', 'large'].map((key) => (
        <Menu.Item key={key}>{key}</Menu.Item>
      ))}
    </Menu>
  );

  const columnsSettingJSX = (
    <main style={{ display: 'none' }} className={styles['setting-columns']}>
      <header>
        <Checkbox>列展示</Checkbox>
        <Button type="link">重置</Button>
      </header>
      <Divider />
    </main>
  );

  const titleJSX =
    typeof title === 'string' ? (
      <h2 className={`${styles.title} ${selectedRowKeys.length ? styles.hide : ''}`}>
        <strong>{title}</strong>
      </h2>
    ) : (
      title
    );

  const tableHeaderJSX = (
    <header className={styles['control-content']}>
      <main>
        <Spin spinning={loading} indicator={<></>}>
          {selectedRowsRef.current?.length ? renderContent?.(selectedRowsRef.current) : titleJSX}
        </Spin>
        {Rights?.map((c, index) => (
          <span key={index}>{c}</span>
        ))}
      </main>

      {
        refresh === false ? null : loading ? (
          <LoadingOutlined />
        ) : (
          <Tooltip title="刷新">
            <RedoOutlined rotate={-90} onClick={refreshTable} className={styles.pointer} />
          </Tooltip>
        )
      }

      {
        density === false ? null : (
          <Tooltip title="密度">
            <Dropdown overlay={columnHeightMenuJSX} trigger={['click']}>
              <ColumnHeightOutlined className={styles.pointer} />
            </Dropdown>
          </Tooltip>
        )
      }

      {
        setting === false ? null : (
          <Tooltip title="列设置">
            <Dropdown overlay={columnsSettingJSX} trigger={['click']}>
              <SettingOutlined className={styles.pointer} />
            </Dropdown>
          </Tooltip>
        )
      }
    </header >
  );

  const renderProps: ComposTableProps = {
    ...props,
    columns,
    size,
    rowSelection,
    queryProps: {
      ...(queryProps ?? Wc.obj),
      onLoading: loadingHandle,
      composeRequest,
      actionRef: [actionRef, actionRef_],
      extendAction: {
        ...(queryProps?.extendAction ?? Wc.obj),
        resetSelectedKeys: effectSelectedRows,
      },
    },
    pagination: { ...pagination, size: size === 'large' ? 'default' : 'small' },
  };

  return (
    <main className={`${styles.wrap} ${className}`}>
      {tableHeaderJSX}
      {children?.(renderProps)}
    </main>
  );
};

export const ComposeControl = React.memo<Model>(ComposeControl_);
export default ComposeControl;
