import React, { useRef } from 'react';
import Wc from 'winchi';
import { useWcConfig, useFirstChange } from '../../hooks';
import type { ComposTableProps, TableActionRef } from '../d.d';
import WcMenu, { WcMenuOption } from '../../Menu';
import styles from './index.less';

type Model = React.FC<ComposTableProps>;

const _menuProps: ComposTableProps['menuProps'] = {
  className: '',
  requestKey: '__menuKey',
};

const ComposeMenu_: Model = ({ children, menuProps: menuProps_, ...props }) => {
  if (!menuProps_) return children?.(props);

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
    className = _menuProps.className,
    requestKey = _menuProps.requestKey,
    preventLoadReload,
    options,
    ...menuProps
  } = menuProps_;

  const lastSelectMenuRef = useRef<WcMenuOption[]>();
  const actionRef = useRef<TableActionRef>();

  const loadHandle = useFirstChange(
    (arr) => {
      arr?.length &&
        actionRef.current?.reload({
          [requestKey + '']: arr,
        });
    },
    [options],
    preventLoadReload ?? preventFirtstRequest ?? false,
  );

  const composeRequest = (f, params) => {
    const composeParams = {
      [requestKey + '']: lastSelectMenuRef.current,
      ...params,
    };
    return composeRequest_ ? composeRequest_(f, composeParams) : f?.(composeParams);
  };

  const menuSelectHandle = (arr: any[]) => {
    lastSelectMenuRef.current = arr;
    loadHandle(arr);
  };

  return (
    <main className={`${styles.wrap} ${className}`}>
      <WcMenu {...menuProps} onChange={menuSelectHandle} options={options} />
      {children?.({
        ...props,
        queryProps: {
          ...queryProps,
          actionRef: [actionRef, actionRef_],
          preventFirtstRequest: true,
          composeRequest,
        },
      })}
    </main>
  );
};

export const ComposeMenu = React.memo<Model>(ComposeMenu_);

export default ComposeMenu;
