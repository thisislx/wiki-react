import React, { useEffect } from 'react';
import { TabPaneProps, TabsProps, Tabs } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { composeComponent } from 'winchi/jsx';
import ComposeOption, { ComposeOptionProps } from '../compose/ComposeOption';
import Wc from 'winchi';
import styles from './index.less';

export type WcTabsOption = TabPaneProps;

export interface WcTabsProps extends TabsProps, Omit<ComposeOptionProps<WcTabsOption>, 'children'> {
  onChange?(key: any): any;
  defaultTab?: string;
  loading?: boolean;
}

const WcTabs_: React.FC<Omit<WcTabsProps, 'options'> & { options?: WcTabsOption[] }> = ({
  options = Wc.arr,
  onChange,
  defaultTab,
  loading,
  className = '',
  ...props
}) => {
  useEffect(() => {
    const firstKey = options[0]?.tabKey;
    if (firstKey) onChange?.(firstKey);
  }, [options]);

  return (
    <Tabs className={`${styles.wrap} ${className}`} onChange={onChange} {...props}>
      {options.map(({ tabKey, className = '', tab, ...o }) => {
        const isLoading = false;
        return (
          <Tabs.TabPane
            key={tabKey}
            className={`${className} ${styles['tab-pane']}`}
            {...o}
            tab={
              <>
                {isLoading ? (
                  <span className={styles['tab-spin']}>
                    <SyncOutlined spin style={{ margin: 0 }} />
                  </span>
                ) : null}
                <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>{tab}</span>
              </>
            }
          />
        );
      })}
    </Tabs>
  );
};

export const WcTabs: React.FC<WcTabsProps> = composeComponent(WcTabs_, ComposeOption);
export default WcTabs;
