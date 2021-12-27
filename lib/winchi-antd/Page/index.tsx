import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Modal } from 'antd';
import Wc, { R } from 'winchi';
import { propDataIndex, processEnum, defaultRender } from '../utils';
import { useWcConfig } from '../hooks';
import { Columns } from '../d';
import type { ComposTableProps, TableActionRef } from '../Table';
import WcForm, { WcFormProps, FormRef } from '../Form';
import styles from './index.less';

export type ComposeRequest<T extends AO = any> = (f: AF, params: T & AO, oldValue: T) => any;

export interface WcPageRef extends FormRef, TableActionRef {
  toggleFormVisible(bool): any;
  editRow(values: AO): any;
}

export interface WcPageProps<T extends AO = any>
  extends Omit<ComposTableProps<T>, 'columns' | 'composeRequest' | 'actionRef'> {
  columns: WcFormProps<T>['columns'] | Columns<T>[];
  onSubmit?(newValues: T, oldValues: T): any;
  publicColumns?: WcFormProps<T>['columns'];
  formProps?: Omit<WcFormProps<T>, 'columns' | 'formRef'>;
  formRef?: React.RefObject<FormRef | undefined>;
  renderForm?(Node: React.ComponentType<any>, props: WcFormProps<T>): React.ReactNode;
  modalWidth?: string | number;
  drawWidth?: number;
  className?: string;
  pageRef?: React.RefObject<WcPageRef | void> | (React.RefObject<WcPageRef | void> | void)[];
  composeTable?(props?: AO): React.ReactNode;
  request?(...p: any[]): Promise<any>;
}

type Model = React.FC<WcPageProps>;

const WcPage_: Model = ({
  columns: columns__,
  publicColumns: publicColumns_ = Wc.arr,
  modalWidth = 600,
  drawWidth = 400,
  className = '',
  formProps = Wc.obj,
  renderForm = defaultRender,
  onSubmit = Wc.func,
  pageRef = Wc.arr,
  composeTable,
  queryProps = Wc.obj,
  ...props
}) => {
  const { wcConfig, setWcConfig } = useWcConfig();
  const [modelVisible, setModalVisible] = useState(false);
  const [columns, setColumns] = useState<WcFormProps['columns']>(Wc.arr);
  const actionRef = useRef<TableActionRef>();
  const formRef = useRef<FormRef>();

  const columns_ = useMemo(() => _defaultDoubleArr(columns__), [columns__]);
  const publicColumns = useMemo(() => _defaultDoubleArr(publicColumns_), [publicColumns_]);
  const flatColumns = useMemo(() => columns.flat(), [columns]);

  const updateColumns = useCallback(
    (newC, index) =>
      setColumns((old) => [...old.slice(0, index), newC, ...old.slice(index + 1)] as any[]),
    [],
  );

  /** 传递form 值 */
  const composeRequest = R.curry((f, params) => {
    return queryProps.composeRequest
      ? queryProps.composeRequest(f, params, formRef.current?.getInitialValues())
      : f?.(params, formRef.current?.getInitialValues());
  });

  /** 处理 columns[] */
  const processColumns: AF = R.compose(
    R.tap(R.forEach(processEnum(updateColumns))),
    Wc.uniqueLeft(propDataIndex),
    R.map(_forceHideExhibit),
  );

  useEffect(() => {
    wcConfig.modalWidth !== modalWidth && setWcConfig({ ...wcConfig, modalWidth });
  }, [modalWidth]);

  useEffect(() => {
    const pageRefArr = Array.isArray(pageRef) ? pageRef.flat() : [pageRef];
    const action: WcPageRef = {
      toggleFormVisible: setModalVisible,
      editRow(values) {
        setModalVisible(!!values);
        formRef.current?.resetForm(values);
      },
      ...(formRef.current || Wc.obj),
      ...(actionRef.current || (Wc.obj as any)),
      reload(params) {
        actionRef.current?.clearHistory?.(params && props.historyProps?.getFeature?.(params));
        actionRef.current?.reload(params);
      },
    };

    pageRefArr.filter((c) => c).forEach((c) => (c.current = action));
  });

  useEffect(
    R.compose(
      setColumns,
      R.map(processColumns),
      _mergeDoubleArr(columns_),
      Wc.idendify(publicColumns),
    ),
    [publicColumns, columns_],
  );

  const submitHandle = async (vs) => {
    const whichomposeRequest = actionRef.current?.composeRequest ?? composeRequest;
    await whichomposeRequest(onSubmit, vs);
    setModalVisible(false);

    formRef.current?.resetForm();
  };

  const tableProps: ComposTableProps = {
    columns: flatColumns,
    ...props,
    queryProps: {
      ...queryProps,
      composeRequest,
      actionRef,
    },
  };

  const renderFormProps: WcFormProps = {
    columns: columns,
    ...formProps,
    onSubmit: submitHandle,
    formRef: formRef,
  };

  return (
    <div className={`${styles.wrap} ${className}`}>
      {composeTable?.(tableProps)}
      <Modal
        onCancel={() => setModalVisible(false)}
        visible={modelVisible}
        footer={null}
        confirmLoading
        width={modalWidth}
      >
        <div className={styles['modal-content']}>{renderForm(WcForm, renderFormProps)}</div>
      </Modal>
    </div>
  );
};

export const WcPage = React.memo<Model>(WcPage_);

export default WcPage;

/**
 * @description ${dataIndex}@开头，除了table隐藏显示
 */
const _forceHideExhibit = (c: Columns): Columns =>
  `${propDataIndex(c)}`.startsWith('@')
    ? {
        ...c,
        hideForm: true,
      }
    : c;

/**
 * @returns 二维数组
 */
const _defaultDoubleArr = (arr: any[]) => (arr[0] && Array.isArray(arr[0]) ? arr : [arr]);

const _mergeDoubleArr = R.curry((arr1: any[], arr2: any[]) => {
  const max = Math.max(arr1.length, arr2.length);
  const r: any[] = [];
  for (let i = 0; i < max; i++) {
    r.push([...(arr1[i] || []), ...(arr2[i] || [])]);
  }
  return r;
});
