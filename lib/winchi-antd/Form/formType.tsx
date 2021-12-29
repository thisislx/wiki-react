import React, { useContext, useEffect, useState } from 'react';
import {
  InputProps,
  InputNumberProps,
  RadioProps,
  SelectProps,
  DatePickerProps,
  TimePickerProps,
  TimePicker,
} from 'antd';
import { Radio, Input, InputNumber, Select, DatePicker } from 'antd';
import Wc from 'winchi';
import { composeComponent } from 'winchi/jsx';
import { Columns, FormComponentProps } from '../d';
import { WcFormContext } from './';
import { defaultRender } from '../utils';
import type { ComposeFormProps } from '../Table';
import { ComposeHistory, ComposeQuery, ComposeForm } from '../Table';
import WcUpload, { WcUploadProps } from '../Upload';
import WcFormList from './List';
import WcTreeSelect, { WcTreeSelectProps } from './TreeSelect';
import WcTree, { WcTreeProps } from '../Tree';
import Cascader, {WcCascadeProps} from '../Cascader'

const { TextArea } = Input;

const FormTable = (props) => composeComponent(ComposeQuery, ComposeForm, ComposeHistory)(props);

export type FormType =
  | 'text'
  | 'textArea'
  | 'number'
  | 'select'
  | 'radio'
  | 'upload'
  | 'table'
  | 'list'
  | 'tree'
  | 'treeSelect'
  | 'password'
  | 'datePicker'
  | 'dateRangePicker'
  | 'timePicker'
  | 'cascader';


export type FormProps =
  | InputProps
  | InputNumberProps
  | RadioProps
  | SelectProps<any>
  | ComposeFormProps
  | WcUploadProps
  | WcTreeProps
  | WcTreeSelectProps
  | DatePickerProps
  | TimePickerProps
  | WcCascadeProps

const mapFC: Record<FormType, AF> = {
  text(props: any) {
    return <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={Input} />;
  },
  textArea(props: any) {
    return (
      <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={TextArea} />
    );
  },
  password(props) {
    return (
      <FormComponentWrap
        {...props}
        onChangeComputeValue={propEventValue}
        Component={Input.Password}
      />
    );
  },
  number(props: any) {
    return <FormComponentWrap {...props} Component={InputNumber} />;
  },
  radio(props: any) {
    return (
      <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={Radio.Group} />
    );
  },
  select(props: any) {
    return (
      <FormComponentWrap
        {...props}
        loading={typeof props.options === 'function'}
        Component={Select}
      />
    );
  },
  table(props: any) {
    const { toggleLoading } = useContext(WcFormContext);
    return (
      <FormComponentWrap
        {...props}
        onLoading={Wc.sep(toggleLoading, props?.onLoading || Wc.func)}
        Component={FormTable}
      />
    );
  },
  upload(props: any) {
    return <FormComponentWrap {...props} Component={WcUpload} />;
  },
  list(props: any) {
    return <FormComponentWrap {...props} Component={WcFormList} />;
  },
  tree(props) {
    return <FormComponentWrap {...props} Component={WcTree} />;
  },
  treeSelect(props) {
    return <FormComponentWrap {...props} Component={WcTreeSelect} />;
  },
  datePicker(props) {
    return <FormComponentWrap {...props} Component={DatePicker} />;
  },
  dateRangePicker(props) {
    return <FormComponentWrap {...props} Component={DatePicker.RangePicker} />;
  },
  timePicker(props) {
    return <FormComponentWrap {...props} Component={TimePicker} />;
  },
  cascader(props) {
    return <FormComponentWrap {...props} Component={Cascader} />;
  }
};

export const propEventValue = (e?) => e?.target?.value;

export const propFormType = (
  key: FormType = 'text',
): React.FC<Omit<FormComponentWrapProps, 'Components'>> => mapFC[key];

export interface FormComponentWrapProps extends React.DetailedHTMLProps<any, any> {
  onChange: AF;
  onChangeComputeValue?: AF;
  column: Columns;
  Component: React.ComponentType<AO>;
}

const FormComponentWrap: React.FC<FormComponentWrapProps> = ({
  onChange = Wc.func,
  Component,
  onChangeComputeValue,
  column,
  ...props
}) => {
  const [value, setValue] = useState<any>();
  const { initialValues } = useContext(WcFormContext);

  useEffect(() => {
    const initialValue = initialValues[column.dataIndex!.toString()];
    if (initialValue === value) return;
    setValue(initialValue);
    onChange(initialValue);
  }, [initialValues]);

  const changeHandle = (...rest) => {
    const newV = onChangeComputeValue?.(...rest) ?? rest[0];
    if (newV === value) return;
    setValue(newV);
    onChange?.(...[newV, rest.slice(1)]);
  };

  const { renderForm = defaultRender } = column;

  const renderProps: FormComponentProps = {
    ...props,
    value,
    onChange: changeHandle,
  };

  return renderForm(Component, renderProps) as any;
};

export default mapFC;
