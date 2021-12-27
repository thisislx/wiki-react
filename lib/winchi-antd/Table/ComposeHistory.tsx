import React, { useMemo, useRef } from 'react';
import type { TableActionRef, ComposTableProps } from './d.d';
import Wc from 'winchi';
import { useWcConfig } from '../hooks';

type Model = React.FC<ComposTableProps>;

const _defaultHistoryProps: ComposTableProps['historyProps'] = {
  getFeature: JSON.stringify,
};

const ComposeHistory_: Model = ({
  children,
  historyProps: { getFeature = _defaultHistoryProps.getFeature } = _defaultHistoryProps,
  queryProps,
  ...props
}) => {
  const {
    wcConfig: { queryProps: defaultQueryProps = Wc.obj },
  } = useWcConfig();

  const { requestPageKey, actionRef: actionRef_, composeRequest: composeRequest_ } =
    queryProps ?? defaultQueryProps!;

  const actionRef = useRef<TableActionRef>();
  const historyMap = useMemo(() => new Map<any, Map<any, AO>>(), []);
  const cachDiasbleRef = useRef<boolean>(false);

  const composeRequest = async (f, params) => {
    const feature = getFeature?.(params);
    const currentHistory = historyMap.get(feature) || new Map();
    const currentPage = params[requestPageKey!];
    const cachDiasble = cachDiasbleRef.current;

    historyMap.set(feature, currentHistory);
    cachDiasbleRef.current = false;

    return currentHistory.get(currentPage) && !cachDiasble
      ? currentHistory.get(currentPage)
      : currentHistory
          .set(currentPage, await (composeRequest_ ? composeRequest_(f, params) : f?.(params)))
          .get(currentPage);
  };

  const childrenProps: ComposTableProps = {
    queryProps: queryProps && {
      ...queryProps,
      composeRequest: composeRequest,
      actionRef: [actionRef, actionRef_],
      extendAction: {
        ...(queryProps?.extendAction ?? Wc.obj),
        clearAllHistory() {
          historyMap.clear();
        },
        clearHistory(feature) {
          feature === undefined ? historyMap.clear() : historyMap.delete(feature);
        },
        reloadAndClearHistory(params) {
          cachDiasbleRef.current = true;
          return actionRef.current?.reload(params);
        },
      },
    },
    ...props,
  };

  return children?.(childrenProps);
};

export const ComposeHistory = React.memo<Model>(ComposeHistory_);
export default ComposeHistory;
