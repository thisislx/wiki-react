import React, { useMemo } from 'react';
import type { ImageProps, ButtonProps } from 'antd';
import { Image } from 'antd';
import Wc, { R } from 'winchi';
import type { Columns } from '../../d';
import type { ComposTableProps } from '../d.d';
import { propDataIndex, sortColumns } from '../../utils';
import styles from './index.less';

/** @type {txt} 支持换行 */
export interface ComposeType<T extends AO = AO> {
  type: TableTypeOfFunc | TableTypeOfString;
  /**
   * @description 拿到类型的 外部属性
   */
  getProps?(
    val: any,
    record: T,
  ): { wrapClassName?: string } & (
    | ImageProps
    | ButtonProps
    | React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  );
  /** 与Columns.renderValue一样使用，优先级高 */
  renderValue?: Columns['renderValue'];
}

export type TableTypeOfFunc<T = any> = AF<
  [any, T, number],
  TableTypeOfString | (Omit<ComposeType, 'type'> & { type: TableTypeOfString })
>;

export type TableTypeOfString = 'default' | 'alias' | 'images' | 'txt' | 'download';

export type TableType<T = any> = TableTypeOfString | ComposeType<T> | TableTypeOfFunc<T>;

type Model = React.FC<ComposTableProps>;

const ComposeType_: Model = ({ columns: columns_ = Wc.arr, children, typeProps, ...props }) => {
  if (!typeProps) return children?.({ ...props, columns: columns_ });
  const { alias } = typeProps;
  const hideInTable = R.filter((c: any) => c.hideTable !== true) as AF;

  const columns = useMemo(
    R.compose(
      sortColumns,
      _pipeColumns(alias),
      hideInTable,
      Wc.uniqueLeft(propDataIndex),
      Wc.idendify(columns_),
    ),
    [columns_, alias],
  );

  const childrenProps = {
    columns,
    ...props,
  };

  return children?.(childrenProps);
};

const _processTypeMap: Record<TableTypeOfString, AF<[AO, { column: Columns; alias: AO }]>> = {
  txt(props: AO) {
    return (d) => <span {...props}>{d}</span>;
  },
  alias(props, { column }) {
    return (d) => {
      const v = column.enum?.[d] ?? d;
      return <main {...props}>{v}</main>;
    };
  },
  images(props) {
    return (images) => {
      const arr = Array.isArray(images) ? images : [images];
      const node = (
        <main className={`${styles.images}`}>
          {arr.map((url, index) => (
            <Image width={100} key={`${url}${index}`} src={url} {...props} />
          ))}
        </main>
      );
      return node;
    };
  },
  download(props) {
    return (url) => {
      return <a href={url} {...props} />;
    };
  },
  default() {
    return (d) => d;
  },
};

const _propsTypeMap = R.curry((map: typeof _processTypeMap, column: Columns, alias: AO) => ({
  ...column,
  render(d, record, index) {
    const types = column.tableType;
    const fns = (Array.isArray(types) ? types : [types]).map((type_) => (node, data, idx) => {
      let type = type_;
      while (typeof type === 'function') {
        type = type(node, data, idx);
      }
      const { type: typeKey, getProps, renderValue } = (Wc.isObj(type)
        ? type
        : { type }) as ComposeType;
      const value = renderValue ? renderValue(node, data) : node;

      const c =
        map[typeKey as string]?.(getProps?.(value, data) || Wc.obj, { column, alias })?.(
          value,
          data,
          index,
        ) ?? node;
      return c;
    });

    const node = fns.reduceRight((resultNode, f) => f(resultNode, record, index), d);
    return column.render ? column.render(node, record, index) : node;
  },
}));

/** renderValue处理 */
const _processrenderValue: AF = (c: Columns): Columns =>
  c.renderValue && c.render
    ? {
        ...c,
        render(_, record, index) {
          return c.render!(c.renderValue!(_, record), record, index);
        },
      }
    : c;

/** render顺序从上到下  */
const _pipeColumns = (alias: AO = Wc.obj) =>
  R.compose(
    R.map(_processrenderValue),
    R.map((c: Columns) => (Wc.isEmpty(c.tableType) ? c : _propsTypeMap(_processTypeMap, c, alias))),
  );

export const ComposeType = React.memo<Model>(ComposeType_);
export default ComposeType;
