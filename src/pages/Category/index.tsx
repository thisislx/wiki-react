import React, { useEffect, useState } from 'react'
import { Table } from 'antd'
import MyTable, { Columns } from '@/components/MyTable'
import request from '@/request'
import { ICategory } from './data.d'

type Model = React.FC

const _columns: Columns<ICategory>[] = [
 {
  title: '名称',
  dataIndex: 'name',
 },
 {
  title: '排序',
  dataIndex: 'sort',
 },
 {
  title: '更新时间',
  dataIndex: 'updateTime',
 },
]

const Cagegory: Model = () => {
 const [dataSource, setDataSource] = useState<ICategory[]>()

 useEffect(() => {
  _queryCategorys().then(setDataSource as AF)
 }, [])

 const expandedRowRender = (d) => {
  return <Table columns={_columns} dataSource={d.children_} />
 }

 return (
  <MyTable
   rowKey={'id'}
   columns={_columns}
   expandable={{ expandedRowRender }}
   dataSource={dataSource?.map(d => ({ ...d, children_: d.children, children: undefined }))}
  />
 );
}

export default React.memo<Model>(Cagegory)


const _queryCategorys = () =>
 request({
  url: '/api/category/all',
 })
