import React, { useMemo, useRef } from 'react';
import Wc from 'winchi';
import { useFirstChange } from '../../hooks';
import type { ComposTableProps, TableActionRef } from '../d.d';
import WcForm from '../../Form';
import styles from './index.less';

type Model = React.FC<ComposTableProps>;

const ComposeFilter_: Model = ({ children, filterProps, ...props }) => {
  if (!filterProps) return children?.(props);

  const { columns: columns_, queryProps } = props;
  const { autoSearch = true, className = '', preventLoadReload, ...formProps } = filterProps;

  const actionRef = useRef<TableActionRef>();
  const lastValues = useRef<AO>();

  const columns = useMemo(
    () =>
      columns_
        ?.filter((c) => c.filter)
        .map((c) => ({
          ...c,
          formType: c.filter?.type ?? c.formType,
          formItemProps: {
            ...(c.formItemProps ?? Wc.obj),
            width: c.filter?.width ?? '30%',
            style: {
              display: 'flex',
              margin: 0,
            },
          },
          hideForm: false,
        })) ?? Wc.arr,
    [columns_],
  );

  const valuesChangeHandle = useFirstChange(
    (values) => {
      lastValues.current = values;
      actionRef.current?.reload(values);
    },
    [],
    preventLoadReload ?? queryProps?.preventFirtstRequest,
  );

  const composeRequest = (f, params_) => {
    const params = Array.isArray(params_)
      ? [...params_]
      : { ...params_, ...(lastValues.current ?? Wc.obj) };

    return queryProps?.composeRequest ? queryProps.composeRequest(f, params) : f?.(params);
  };

  return (
    <>
      {columns.length ? (
        <header className={`${styles.header} ${className}`}>
          <WcForm {...formProps} hideSubmit columns={columns} onValuesChange={valuesChangeHandle} />
        </header>
      ) : null}
      {children?.({
        ...props,
        queryProps: {
          ...(queryProps ?? Wc.obj),
          preventFirtstRequest: true,
          actionRef: [actionRef, props.queryProps?.actionRef],
          composeRequest,
        },
      })}
    </>
  );
};

export const ComposeFilter = React.memo<Model>(ComposeFilter_);

export default React.memo<Model>(ComposeFilter);
