import React, { useRef } from 'react';
import Wc from 'winchi';
import { useFirstChange, useWcConfig } from '../../hooks';
import type { ComposTableProps, TableActionRef } from '../d.d';
import WcTabs, { WcTabsOption } from '../../Tabs';

type Model = React.FC<ComposTableProps>;

const _tabsProps: ComposTableProps['tabsProps'] = {
  className: '',
  requestKey: '__tabKey',
  WrapTab: ({ children }) => <>{children}</>,
};

const ComposeTabs_: Model = ({ children, tabsProps, ...props }) => {
  if (!tabsProps) return children?.(props);

  const {
    wcConfig: { queryProps: defaultQueryProps = Wc.obj },
  } = useWcConfig();
  const { queryProps: queryProps_ } = props;

  const {
    composeRequest: composeRequest_,
    actionRef: actionRef_,
    preventFirtstRequest,
    ...queryProps
  } = queryProps_ ?? defaultQueryProps!;

  const {
    className = _tabsProps.className,
    onChange = Wc.func,
    options,
    WrapTab = _tabsProps.WrapTab as any,
    requestKey: requestKey_ = _tabsProps.requestKey,
    preventLoadReload,
    preventLoadReloadKeys,
    ...menuProps
  } = tabsProps ?? _tabsProps;

  const requestKey = requestKey_ + '';

  const lastTabRef = useRef<WcTabsOption[]>();
  const actionRef = useRef<TableActionRef>();

  const composeRequest = (f, params) => {
    const composeParams = Array.isArray(params) ? [...params] : { ...params };
    composeParams[requestKey] = lastTabRef.current;
    return composeRequest_ ? composeRequest_(f, composeParams) : f(composeParams);
  };

  const reloadHandle = useFirstChange(
    (key) => {
      preventLoadReloadKeys?.includes(key) ||
        actionRef.current?.reload({
          [requestKey]: key,
        });
    },
    [options],
    preventLoadReload ?? preventFirtstRequest,
  );

  const tabChangeHandle = (key) => {
    lastTabRef.current = key;
    reloadHandle(key);
    onChange(key);
  };

  return (
    <>
      <WrapTab>
        <WcTabs {...menuProps} options={options} onChange={tabChangeHandle} />
      </WrapTab>

      {children?.({
        ...props,
        queryProps: {
          ...queryProps,
          actionRef: [actionRef, actionRef_],
          composeRequest,
          preventFirtstRequest: true,
        },
      })}
    </>
  );
};

export const ComposeTabs = React.memo<Model>(ComposeTabs_);

export default React.memo<Model>(ComposeTabs);
