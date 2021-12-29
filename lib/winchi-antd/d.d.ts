import type { OptionProps } from 'antd/lib/select';
import type { ColumnProps } from 'antd/lib/table';
import type { FormItemProps, FormListProps } from 'antd/lib/form';
import type { FormProps, FormType } from './Form';
import type { TableType, ComposeFormProps } from './Table';
import type { WcUploadProps } from './Upload';
import { defaultAlias } from './App';

export interface LayoutSize {
  width?: string | number;
}

export interface ColumnFormItemProps
  extends Omit<FormItemProps, 'label' | 'name' | 'initialValue'>,
    LayoutSize {
  width?: string | number;
}

export interface ColumnFormListProps
  extends Omit<FormListProps, 'label' | 'name' | 'initialValue' | 'children'>,
    LayoutSize {
  columns: Columns[];
}

export type ColumnEnum = Record<string | number, React.ReactNode> | OptionProps[];

export interface Columns<T extends AO = any> extends ColumnProps<T> {
  dataIndex?: keyof T;
  /** @description 开启过滤 */
  filter?: {
    /** 覆盖../formType */
    type?: FormType;
    /** 占据宽度 */
    width?: string;
  };
  /** @description column.render的返回值*/
  renderValue?(formItemValue: any, record: T): any;
  /**
   * @用作展示：优先级高于alias
   * @用作表单：优先级低于formProps.options
   */
  enum?: ColumnEnum | AF<any[], Promise<ColumnEnum>> | AxiosPromise<ColumnEnum>;
  /** @type [compose的顺序，从后到前] */
  tableType?: TableType<T> | TableType<T>[];
  /** <Form.FormItem><FormComponent {...props}  /></Form.FormItem>  */
  formProps?: FormProps & LayoutSize;
  hideTable?: boolean;
  hideDetail?: boolean;
  /** @description x轴顺序 */
  xIndex?: number;
  initialValue?: any | ((formItemValue: any, record: T) => any);
  /** @description <Form.FormItem {...props} /> */
  formItemProps?: ColumnFormItemProps;
  formListProps?: ColumnFormListProps;
  formType?: FormType;
  hideForm?: boolean;
  formResult?: false | ((formItemValue: any, formValues: any) => any);
  renderForm?: AF<Parameters<Render>, React.ReactNode>;
  /**
   * @params2 针对formList (d: AO, index: Form.List第几项)
   * @returns 返回的结果浅复制当前Column
   * */
  dynamicColumn?(d: T, index?: number): Columns<T>;
}

export interface WcConfig {
  size?: 'small' | 'middle' | 'large';
  modalWidth?: number | string;
  queryProps?: ComposeFormProps['queryProps'];
}

export interface FormComponentProps {
  onChange?(v): any;
  value?: any;
  [x: string]: any;
}
