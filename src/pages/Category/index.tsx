import React, {  useMemo, useState } from 'react'
import MyTable, { Columns } from '@/components/MyTable'
import request from '@/request'
import { ICategory } from './data.d'
import { Button } from 'antd'

type Model = React.FC

const Cagegory: Model = () => {
 const [dataSource, setDataSource] = useState<ICategory[]>()

 const refreshDataSource = async () => {
  const data: any = await queryCategorys()
  setDataSource(data)
  return {
  records: data.map(d => ({ ...d, children_: d.children, children: undefined }))
  } 
 }

 const columns = useMemo<Columns<ICategory>[]>(() => [
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
   hideForm: true,
  },
  {
   title: '父节点',
   dataIndex: 'parent' as any,
   hideTable: true,
   formType: 'select',
   initialValue: '0',
   enum: {
    ...dataSource?.reduce((r, c) => ({ ...r, [c.id]: c.name }), {} as AO),
    0: '自己就是父节点',
   }
  },
 ], [dataSource])

 const expandedRowRender = (d) => {
  return <MyTable
   columns={columns}
   dataSource={d.children_}
   controlProps={{ disable: true }}
   handlesNode={(childrenData) => (
    <>
     <Button danger type='text' onClick={() => _removeCategory([childrenData.id])}>删除</Button>
    </>
   )}
  />
 }

 return (
  <MyTable
   columns={columns}
   expandable={{ expandedRowRender }}
   onRemove={_removeCategory}
   onUpdate={(newD, { id }) => _updateCategory({ ...newD, id })}
   onAdd={_addCategory}
   request={refreshDataSource}
  />
 );
}

export default React.memo<Model>(Cagegory)

export const queryCategorys = () =>
 request({
  url: '/api/category/all',
 })

const _addCategory = (data: ICategory) =>
 request({
  url: '/api/category/add',
  method: 'POST',
  data,
 })


const _updateCategory = (data: ICategory) =>
 request({
  url: '/api/category/update',
  method: 'POST',
  data,
 })

const _removeCategory = (ids: number[]) =>
 request({
  url: '/api/category/remove',
  method: 'POST',
  data: ids,
 })


