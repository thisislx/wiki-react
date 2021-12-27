import React, { useEffect, useMemo } from 'react';
import type { MenuProps, MenuItemProps, SubMenuProps } from 'antd';
import { Menu } from 'antd';
import Wc, { R } from 'winchi';
import { composeComponent } from 'winchi/jsx';
import ComposeOption, { ComposeOptionProps } from '../compose/ComposeOption';
import styles from './index.less';

const { SubMenu, Item } = Menu;

export interface WcMenuOption extends MenuItemProps, SubMenuProps {
  title: string;
  key: string | number;
  children?: WcMenuOption[];
  /** @description 其他信息 */
  data?: any;
}

export interface WcMenuProps
  extends Omit<MenuProps, 'onChange'>,
    Omit<ComposeOptionProps<WcMenuOption>, 'children'> {
  title?: string;
  onChange?(options: WcMenuOption[]): any;
}

type Model = React.FC<Omit<WcMenuProps, 'options'> & { options?: WcMenuOption[] }>;

const WcMenu_: Model = ({
  title,
  options = Wc.arr,
  onChange = Wc.func,
  mode = 'inline',
  ...props
}) => {
  const defaultKey = useMemo(
    () => (options.length ? [_findFirstSelectedKeys(options)[0]] : undefined),
    [options],
  );

  useEffect(() => {
    options?.length && selectHandle(options)({ selectedKeys: defaultKey });
  }, [options]);

  const selectHandle: AF = (os) =>
    R.compose(
      (arr?: any[]) => arr?.length && onChange(arr),
      _selectedKeysBackOption(os),
      R.prop('selectedKeys') as AF,
    );

  return (
    <>
      <h2 className={`ant-table-cell ${styles.title}`}>{title}</h2>
      {options?.length ? (
        <Menu
          onSelect={selectHandle(options)}
          mode={mode}
          defaultSelectedKeys={defaultKey}
          defaultOpenKeys={[options[0].key.toString()]}
          {...props}
        >
          {options.map(resolveWcMenuOption)}
        </Menu>
      ) : null}
    </>
  );
};

export const resolveWcMenuOption = ({ children, data, ...props }: WcMenuOption) =>
  children ? (
    <SubMenu {...props}>{children.map((c) => resolveWcMenuOption(c))}</SubMenu>
  ) : (
    <Item {...props}>{props.title}</Item>
  );

const _findFirstSelectedKeys = (options: WcMenuOption[]): any[] =>
  options[0]?.children?.length
    ? _findFirstSelectedKeys(options[0].children)
    : [options[0]?.key.toString()];

const _selectedKeysBackOption = R.curry((options: WcMenuOption[], keys: string[]) =>
  options.reduce((r, o) => {
    if (r.length === keys.length) return r;
    const right = keys.find((key) => key === `${o.key}`);
    const findOptions = right
      ? [o]
      : o.children
      ? _selectedKeysBackOption(o.children, keys)
      : Wc.arr;
    return findOptions.length ? [...r, ...findOptions] : r;
  }, [] as any[]),
);

export const WcMenu: React.FC<WcMenuProps> = React.memo((props) =>
  composeComponent(WcMenu_, ComposeOption)(props),
);

export default WcMenu;
