import React from 'react';
import Wc from 'winchi';
import WcFormItem from './Item';
import WcFormList from './List';
import type { FormComponentWrapProps } from './formType';
import type { Columns } from '../d';

export interface WcResolveChidrenProps extends Partial<FormComponentWrapProps>, Columns {
  hide?: boolean;
  enum?: AO;
}

type Model = React.FC<WcResolveChidrenProps>;

const ResolveChidren: Model = ({ formProps: formProps_ = Wc.obj, hide, hideForm, ...props }) => {
  const formProps = formProps_.options
    ? formProps_
    : {
        options: props.enum && (Array.isArray(props.enum) ? props.enum : _objToLabel(props.enum)),
        ...formProps_,
      };

  const commonProps = {
    ...props,
    hide: hide || hideForm,
    formProps,
  };

  return props.formType === 'list' ? (
    <WcFormList {...commonProps} />
  ) : (
    <WcFormItem {...commonProps} />
  );
};

export default React.memo<Model>(ResolveChidren);

const _objToLabel = (o: AO): { label: string; value: any }[] =>
  Object.entries(o).map(([value, label]) => ({ label, value }));
