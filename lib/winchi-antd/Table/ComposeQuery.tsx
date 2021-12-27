import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'antd';
import { TablePaginationConfig } from 'antd/lib/table';
import Wc, { R } from 'winchi';
import type { ComposTableProps, TableActionRef } from './d.d';
import { useWcConfig } from '../hooks';

type Model = React.FC<ComposTableProps>;

const ComposeQuery_: Model = ({ children, queryProps, ...props }) => {
  const { pagination: pagination_ = Wc.obj, columns = Wc.arr, rowKey = 'id' } = props;

  const {
    wcConfig: { queryProps: defaultQueryProps = Wc.obj, size },
  } = useWcConfig();

  const {
    request = defaultQueryProps.request,
    composeRequest: composeRequest_ = defaultQueryProps.composeRequest,
    actionRef = defaultQueryProps?.actionRef,
    onLoading = defaultQueryProps?.onLoading,
    preventFirtstRequest = defaultQueryProps?.preventFirtstRequest,
    startCurrent = defaultQueryProps?.startCurrent,
    pageSize = defaultQueryProps.pageSize,
    propData = defaultQueryProps.propData,
    propTotal = defaultQueryProps?.propTotal,
    requestPageKey = defaultQueryProps.requestPageKey,
    requestPageSizeKey = defaultQueryProps.requestPageSizeKey,
    extendAction = Wc.obj,
    one = false,
  } = queryProps ?? defaultQueryProps!;
  const [spinning, setSpinning] = useState(true);
  const [data, setData] = useState<AO[]>(Wc.arr);
  const [currentPage, setCurrentPage] = useState(startCurrent);
  const requestDebounce = useMemo<AF>(() => Wc.debouncePromise(setData), []);
  const totalRef = useRef<number>(startCurrent);
  const spinTimeOutId = useRef<any>();

  useEffect(() => {
    const actionRefArr = Array.isArray(actionRef) ? actionRef : [actionRef];
    const action: TableActionRef = {
      reload: (params = Wc.obj) => {
        const newPage = params[requestPageKey] ?? startCurrent;
        setCurrentPage(newPage);
        return queryDataSource(params);
      },
      composeRequest,
      ...extendAction,
    };

    actionRefArr
      .flat(Number.MAX_SAFE_INTEGER)
      .forEach((actRef) => actRef && (actRef.current = action));
  }, []);

  useEffect(() => {
    if (preventFirtstRequest && startCurrent === currentPage && startCurrent === totalRef.current)
      return;
    queryDataSource(Wc.obj);
  }, [currentPage]);

  const toggleSpinning = (b: boolean) => () => {
    const trigger = () => {
      clearTimeout(spinTimeOutId.current);
      onLoading?.(b);
      setSpinning(b);
    };
    b ? (spinTimeOutId.current = setTimeout(trigger, 200)) : trigger();
  };

  const effectData: AF = (d) => {
    const newData = Wc.prop(propData, d) || Wc.arr;
    const totalPage = Wc.prop(propTotal, d) ?? 1;
    totalRef.current = totalPage;
    newData.length;
    setData(newData);
  };

  const requestCatchHandle = (e) => {
    if (e === setData) return e;
    toggleSpinning(false)();
    setData(Wc.arr);
    return Promise.reject(e);
  };

  const requestEffect = R.ifElse(Wc.isExtendObj, effectData, requestCatchHandle);

  const composeRequest = R.curryN(2, (method: AF, params) =>
    Promise.resolve(composeRequest_!(method, params ?? Wc.obj)),
  );

  const queryDataSource = Wc.asyncCompose(
    toggleSpinning(false),
    requestEffect,
    R.compose(requestDebounce, composeRequest(request!)),
    R.merge({
      [requestPageKey!]: currentPage,
      [requestPageSizeKey!]: pageSize,
    }),
    R.tap(toggleSpinning(true)),
  ).catch(requestCatchHandle);

  const pagination: TablePaginationConfig | undefined =
    pagination_ === false && !one
      ? undefined
      : {
        hideOnSinglePage: true,
        pageSize,
        total: totalRef.current,
        current: currentPage,
        ...pagination_,
        onChange(page, pageSize) {
          setCurrentPage(page - 1 + startCurrent);
          (pagination_ as any)?.onChange?.(page, pageSize);
        },
        size: size !== 'large' ? 'small' : 'default',
      };

  const childrenProps: ComposTableProps<any> = {
    columns,
    scroll: {
      x: columns.length * 120,
    },
    rowKey,
    ...props,
    dataSource: data,
    pagination: one
      ? { pageSize, size: pagination?.size, hideOnSinglePage: pagination?.hideOnSinglePage }
      : pagination,
    loading: spinning,
  };

  return children ? children(childrenProps) : <Table {...(childrenProps as any)} />;
};

export const ComposeQuery = React.memo<Model>(ComposeQuery_);
export default ComposeQuery;
