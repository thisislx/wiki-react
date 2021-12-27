import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';
import type { FormInstance } from 'antd';
import { Form, Button, Divider } from 'antd';
import Wc, { R } from 'winchi';
import type { Columns } from '../d';
import { useWcConfig } from '../hooks';
import ResolveChidren from './ResolveChidren';
import styles from './index.less';
import { sortColumns, dynamicForm } from '../utils';

export interface FormRef extends FormInstance {
  toggleSubmitLoading(b: boolean): any;
  resetForm(values?: AO): any;
  setInitialValues(values: AO): any;
  getInitialValues(): AO;
}

export interface WcFormProps<T extends AO = any>
  extends Omit<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
    'onSubmit'
  > {
  /**
   * @description 二维数组，第一项为分布表单的第一页
   */
  columns: Columns<T>[] | Columns<T>[][];
  /**
   * @description 分布表单步骤标题
   */
  steps?: string[];
  onSubmit?(data: T, defaultData?: T): any;
  formRef?: React.RefObject<FormRef | undefined> | React.RefObject<FormRef | undefined>[];
  hideSubmit?: boolean;
  onValuesChange?(values: T): any;
}

export interface WcFormContextValue {
  toggleLoading: AF;
  onValuesChange(dataIndex: any, f: AF): any;
  initialValues: AO;
}

type Model = React.FC<WcFormProps>;

export const WcFormContext = createContext<WcFormContextValue>({
  toggleLoading: Wc.func,
  onValuesChange: Wc.func,
  initialValues: Wc.obj,
});

export const filterFormColumns: AF = R.compose(
  Wc.uniqueLeft(R.prop('dataIndex')),
  R.filter((d: Columns) => d.hideForm !== true),
);

const WcForm_: Model = ({
  columns: columns_ = Wc.arr,
  steps,
  onSubmit,
  className = '',
  onValuesChange: onValuesChange_,
  formRef: formRef_ = {},
  hideSubmit,
  ...props
}) => {
  const columnsArr = useMemo(
    () => columns_.map((d) => (Array.isArray(d) ? d : [d])).filter((d) => d?.length),
    [columns_],
  );
  const { wcConfig } = useWcConfig();
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<AO[]>(Wc.arr);
  const [currentStep, setCurrentStep] = useState(0);
  const [initialValues, setInitialValues] = useState(Wc.obj);

  const formChangeDispatchMap = useMemo(() => new Map(), []);
  const flatColumnsRef = useRef<Columns[]>(Wc.arr);
  const formRef = useRef<FormRef>(null);
  const isResetFormEffect = useRef<boolean>(true);

  useEffect(() => {
    const action: Partial<FormRef> = {
      ...(formRef.current || Wc.obj),
      toggleSubmitLoading(bool) {
        setLoading(bool);
      },
      resetForm(values) {
        setCurrentStep(0);
        initalValuesEffect(columnsArr, values);
      },
      setInitialValues: initalValuesEffect,
      getInitialValues: () => initialValues,
    };
    const formRefArr = (Array.isArray(formRef_) ? formRef_.flat() : [formRef_]).concat(formRef);
    formRefArr.forEach((actRef) => ((actRef as any).current = action));
  });

  /** 向子组件抛出 formValueChange */
  const formChangeDispatch = (d) =>
    Array.from(formChangeDispatchMap.values()).forEach((f) => f?.(d));

  const valuesEffectColumns = R.curry((ccs, values) =>
    R.compose(
      setColumns,
      _processColumns(ccs),
      R.tap(Wc.debounce(100, formChangeDispatch)),
    )(values),
  );

  const initalValuesEffect: AF = (ccs: any[], values: AO = Wc.obj) => {
    const newInitialValues = _computeinitialValues((flatColumnsRef.current = ccs.flat()), values);
    setCurrentStep(0);
    setInitialValues(newInitialValues);
    valuesEffectColumns(ccs, newInitialValues);
    isResetFormEffect.current = true;
    setTimeout(() => {
      formRef.current?.setFieldsValue(newInitialValues);
    });
  };

  /* process columns */
  useEffect(() => {
    initalValuesEffect(columnsArr, Wc.obj);
  }, [columnsArr]);

  const stepMaxNum = columns.length - 1;

  const checkValidata = () =>
    formRef.current?.validateFields(columns[currentStep]?.map(R.prop('dataIndex') as AF));

  const submitBefore = Wc.asyncCompose(checkValidata, () => setLoading(true));

  const onValuesChange = useCallback(
    debounce((_, values) => {
      isResetFormEffect.current || valuesEffectColumns(columnsArr, values);
      isResetFormEffect.current = false;
      onValuesChange_?.(values);
    }, 200),
    [columnsArr],
  );

  const submitHandle = Wc.asyncCompose(async () => {
    const vs = flatColumnsRef.current.reduce((r, c) => {
      const key = c.dataIndex + '';
      if (typeof c.formResult === 'function') r[key] = c.formResult(r[key], r);
      c.formResult === false && Reflect.deleteProperty(r, key);
      return r;
    }, formRef.current?.getFieldsValue());
    await onSubmit?.(vs, initialValues);
  }, submitBefore)
    .catch((err) => {
      console.error(`form submit`, err);
    })
    .finally(() => {
      setLoading(false);
    });

  const clickNextHandle = Wc.asyncCompose(
    () => (currentStep < stepMaxNum ? setCurrentStep(currentStep + 1) : submitHandle()),
    checkValidata,
  );

  const clickResetHandle = () => {
    formRef.current?.resetForm({});
  };

  const formSubmitCatureHandle = (e) => {
    e.nativeEvent.preventDefault();
    clickNextHandle();
  };

  const formItemJSX = columns.map((cc, index) =>
    cc.map((c: Columns) => (
      <ResolveChidren key={`${c.dataIndex}`} {...c} hide={index !== currentStep} />
    )),
  );
  const footerJSX = columns[currentStep]?.length ? (
    <footer className={styles.footer}>
      <Button size={wcConfig.size} onClick={clickResetHandle}>
        重置
      </Button>
      <section>
        {stepMaxNum && currentStep ? (
          <Button size={wcConfig.size} onClick={() => setCurrentStep(currentStep - 1)}>
            上一步
          </Button>
        ) : null}
        <Button
          size={wcConfig.size}
          loading={currentStep + 1 === columns?.length && loading}
          onClick={clickNextHandle}
          type="primary"
        >
          {currentStep === stepMaxNum ? '提交' : '下一步'}
        </Button>
      </section>
    </footer>
  ) : null;

  return (
    <WcFormContext.Provider
      value={{
        toggleLoading: setLoading,
        onValuesChange(dataIndex, f) {
          formChangeDispatchMap.set(dataIndex, f);
        },
        initialValues,
      }}
    >
      <main {...props} className={`${className}`}>
        {columnsArr.length > 1 ? (
          <header className={styles.header}>
            <span>
              <strong className={styles['current-step']}>{currentStep + 1}</strong> /{' '}
              {columnsArr.length}
            </span>
            <span className={styles['header-title']}>{steps?.[currentStep]}</span>
            <span />
          </header>
        ) : null}

        {hideSubmit ? null : <Divider className={styles.divider} dashed />}
        <Form
          ref={formRef}
          className={styles.form}
          onValuesChange={onValuesChange}
          onSubmitCapture={formSubmitCatureHandle}
        >
          {formItemJSX}
          <button type="submit" style={{ display: 'none' }} />
        </Form>

        {hideSubmit ? null : <Divider className={styles.divider} dashed />}

        {hideSubmit ? null : footerJSX}
      </main>
    </WcFormContext.Provider>
  );
};

export const WcForm: Model = React.memo(WcForm_);
export default WcForm;

const _computeinitialValues = R.curry((columns: Columns[], values: AO) => ({
  ...values,
  ...columns.reduce((r, c) => {
    const dataIndex = c.dataIndex + '';
    const dataIndexValue = r[dataIndex] ?? c.initialValue;
    const newR = {
      ...r,
      [dataIndex]: dataIndexValue,
    };
    newR[dataIndex] =
      typeof c.initialValue === 'function' ? c.initialValue(r[dataIndex], newR) : dataIndexValue;
    return newR;
  }, values ?? Wc.obj),
}));

const _processColumns = R.curry((columns, values) =>
  R.compose(R.map(sortColumns), R.filter(Wc.propLength) as AF, R.map(filterFormColumns), (values) =>
    columns.map(dynamicForm(R.__, values)),
  )(values),
);

export * from './formType';
