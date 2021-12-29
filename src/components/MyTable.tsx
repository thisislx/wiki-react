import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Alert, Button, Popconfirm, Table } from 'antd';
import Wc from 'winchi';
import type { WcPageProps, WcPageRef, Columns } from 'winchi-antd';
import { composeComponent } from 'winchi/jsx';
import {
  WcPage,
  WcProvider,
  ComposeQuery,
  ComposeControl,
  ComposeHistory,
  ComposeType,
  ComposeMenu,
  ComposeTabs,
  ComposeFilter,
} from 'winchi-antd';

export interface FormPageProps<T extends AO = any>
  extends Omit<Partial<WcPageProps<T>>, 'children'> {
  onAdd?: AF;
  onRemove?: AF;
  onUpdate?: AF;
  onClickEdit?(d: T): any;
  /** handle compose  */
  handlesNode?(d: T): React.ReactNode;
  handlesWidth?: number;
  tabsWithColumns?: Record<string, Columns[]>;
  composeRequest?(f: AF, data: AO, oldData?: AO): any;
  children?: React.ReactNode;
  request?(...p: any[]): Promise<any>;
}

const _composeTable = composeComponent(
  Table,
  ComposeQuery,
  ComposeType,
  ComposeMenu,
  ComposeControl,
  ComposeFilter,
  ComposeTabs,
  ComposeHistory,
);

export const FormPage: React.FC<FormPageProps> = ({
  onAdd,
  onRemove,
  onUpdate,
  rowKey = 'id',
  composeRequest: composeRequest_ = (f, a, b) => f?.(a, b),
  pageRef: pageRef_,
  onClickEdit,
  publicColumns: publicColumns_,
  handlesNode,
  handlesWidth = 70,
  tabsProps,
  tabsWithColumns,
  columns: columns_ = Wc.arr,
  children,
  queryProps = Wc.obj,
  request,
  ...props
}) => {
  const [columns, setColumns] = useState<Columns[]>(columns_);
  const pageRef = useRef<WcPageRef>();
  const isUpdateRef = useRef<boolean>(false);
  const lastTabKeyRef = useRef<string>();

  useEffect(() => {
    const c = lastTabKeyRef.current && tabsWithColumns?.[lastTabKeyRef.current] || columns_;
    c && setColumns(c);
  }, [tabsWithColumns, columns_]);

  const publicColumns = useMemo<Columns[]>(
    () => [
      {
        dataIndex: '@handle',
        hideForm: true,
        fixed: 'right',
        xIndex: 99,
        width: handlesWidth,
        hideTable: !onUpdate && !handlesNode,
        render(_, d) {
          return (
            <>
              <Button type="link" onClick={() => clickEditHandle(d)}>
                编辑
              </Button>
              {handlesNode?.(d)}
            </>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const composeRequest = async (f, newV, oldV?) => {
    const callback = (() => {
      if (f === Wc.func) return isUpdateRef.current ? onUpdate : onAdd;
      return f;
    })();

    const value = await (composeRequest_
      ? composeRequest_(callback, newV, oldV)
      : callback(newV, oldV));

    /** WcPage.onSubmit = Wc.func */
    if (f === Wc.func || f === onRemove) pageRef.current?.reload();
    return value;
  };

  const removeHandle = async (rows: AO[]) => {
    await pageRef.current?.composeRequest(onRemove!)(rows.map((row) => row[rowKey]));
    pageRef.current?.resetSelectedKeys?.();
  };

  const clickAdd = () => {
    isUpdateRef.current && pageRef.current?.resetForm?.();
    isUpdateRef.current = false;
    pageRef.current?.toggleFormVisible(true);
  };

  const clickEditHandle = (row: AO) => {
    isUpdateRef.current = true;
    onClickEdit?.(row);
    setTimeout(() => {
      pageRef.current?.toggleFormVisible(true);
      pageRef.current?.resetForm?.(row);
    }, 50);
  };

  return (
    <WcProvider>
      <WcPage
        columns={columns}
        rowKey={rowKey}
        onSubmit={Wc.func}
        pageRef={[pageRef, ...(Array.isArray(pageRef_) ? pageRef_ : [pageRef_])]}
        composeTable={_composeTable}
        queryProps={{ request, ...queryProps, composeRequest }}
        typeProps={Wc.obj}
        historyProps={{
          getFeature(params) {
            return JSON.stringify(params);
          },
        }}
        controlProps={{
          Rights: [
            onAdd && (
              <Button type="primary" onClick={clickAdd}>
                新增
              </Button>
            ),
          ],
          renderContent: (rows) => (
            <Alert
              closable
              message={`已选择 ${rows?.length ?? 0} 条`}
              closeText="取消选择"
              onClose={() => {
                setTimeout(() => {
                  pageRef.current?.resetSelectedKeys?.();
                }, 200);
              }}
              action={
                onRemove && (
                  <>
                    <Popconfirm
                      okType="danger"
                      title="确定删除吗？"
                      onConfirm={() => removeHandle(rows)}
                    >
                      <Button size="small" type="text" danger>
                        批量删除
                      </Button>
                    </Popconfirm>
                  </>
                )
              }
            />
          ),
        }}
        publicColumns={publicColumns}
        {...props}
      />

      {children}
    </WcProvider>
  );
};

export default React.memo<React.FC<FormPageProps>>(FormPage);

export * from 'winchi-antd'