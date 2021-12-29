import React from 'react';
import type { TableProps, TablePaginationConfig } from 'antd/lib/table';
import type { TableRowSelection } from 'antd/lib/table/interface';
import type { ComposeComponentProps } from 'winchi/jsx';
import { WcMenuProps, WcMenuOption } from '../Menu';
import type { WcFormProps } from '../Form';
import type { WcTabsProps } from '../Tabs';
import type { Columns } from '../d';

export type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

export type DefaultTableProps<T extends AO = any> = Omit<TableProps<T>, 'columns'>;

export interface ComposTableProps<T extends AO = any>
  extends Omit<DefaultTableProps, 'rowKey' | 'children' | 'rowSelection'>,
    ComposeComponentProps {
  columns?: Columns<T>[];
  rowKey?: string;
  rowSelection?: fasle | DefaultTableProps['rowSelection'];
  onChange?: DefaultTableProps['rowSelection'] | DefaultTableProps['onChange'];
  value?: any[];

  queryProps?: {
    actionRef?: { current?: AO } | ({ current?: AO } | void)[];
    composeRequest?(fn: AF, params: AO): Promise<any> | any;
    request?(params: AO): any;
    pageSize?: number;
    onLoading?(boolean): any;
    preventFirtstRequest?: boolean;
    propTotal?: GetKey;
    propData?: GetKey;
    requestPageKey?: string;
    requestPageSizeKey?: string;
    startCurrent?: number;
    /** 让actionRef出现更多的可能性 */
    extendAction?: AO;
    /** 只请求一次dataSource，没有currengPage的介入 */
    one?: boolean;
  };

  filterProps?: {
    /** form value 改变就请求 */
    autoSearch?: boolean;
    preventLoadReload?: boolean;
  } & Omit<WcFormProps, 'columns'>;

  historyProps?: {
    /** 拿到缓存特征，如不同的tabs */
    getFeature?(requestParams: AO): any;
  };

  typeProps?: {
    alias?: AO;
  };

  controlProps?: {
    className?: string;
    title?: React.ReactNode;
    /** 刷新 */
    refresh?: boolean;
    /** 密度 */
    density?: boolean;
    /** 设置column */
    setting?: boolean;
    /** 新增所在的位置 */
    Rights?: React.ReactNode[];
    /** 删除位置 所在的位置 */
    renderContent?: (rows: T[]) => React.ReactNode;
    /** 关闭control */
    disable?: boolean;
  } & DivProps;

  menuProps?: {
    requestKey?: string;
    preventLoadReload?: boolean;
  } & WcMenuProps;

  tabsProps?: {
    requestKey?: string;
    preventLoadReload?: boolean;
    /** 阻止key自动触发  */
    preventLoadReloadKeys?: string[];
    className?: string;
    WrapTab?: React.ComponentType;
  } & WcTabsProps;
}

export interface TableActionRef {
  // query
  reload(o?: AO): any;
  /**让函数走composeRequest通道 */
  composeRequest(f: AF, data?: any): any;

  // control
  /** 支持rowKey 和 row 选择  */
  resetSelectedKeys?(keys?: (AO | string | number)[]): any;

  // history
  clearAllHistory?(): any;
  /** 不传feature，默认全部清除 */
  clearHistory?(feature?: string): any;
  reloadAndClearHistory?(params?: AO): any;
}
