import React from 'react'
import { Cascader, CascaderProps } from 'antd'
import { composeComponent } from 'winchi/jsx';
import ComposeOption, { ComposeOptionProps } from '../compose/ComposeOption'

export interface WcCascadeProps<DataNodeType = any>
 extends Omit<CascaderProps<DataNodeType>, 'options' | 'children'>, ComposeOptionProps {

}

type Model = React.FC<WcCascadeProps>

const WcCascader_: Model = ({ ...props }) => {
 return (
  <Cascader {...props as any} />
 )
}

export const WcCascader = composeComponent(
 WcCascader_,
 ComposeOption,
)

export default React.memo<Model>(WcCascader)