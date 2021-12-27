import React from 'react';
import { obj } from './index';

export interface ComposeComponentProps<Props = AO> {
  children?(props: Props): any;
}

/**
 * @description 我只要告诉每个component你的children是什么，而不关心props的值
 */
export const composeComponent = <Props extends AO = any>(Base, ...Cs) => {
  const render = Cs.reduce(
    (chldren, C) => (props: AO) => <C {...props}>{chldren}</C>,
    (props) => <Base {...props} />,
  );
  return (props: Props = obj) => render(props);
};

export const Tab = (f: (props: AO) => any) => ({ children, ...props }) => {
  f(props);
  return children?.(props);
};

/** React.memo */
export const Memo = (props) => {};
