import React from 'react'
import MyTable, { Columns } from '@/components/MyTable'
import * as R from 'ramda'
import Wc from 'winchi'
import request from '@/request'
import { queryCategorys } from '../Category'
import type { IBook } from './data.d'

const _queryCategorys: AF = Wc.asyncCompose(
 R.map(Wc.deepPropRename('children', {
  name: 'label',
  id: 'value',
 })),
 queryCategorys,
)

const _columns: Columns<IBook>[] = [
 {
  title: '名字',
  dataIndex: 'name',
 },
 {
  title: '描述',
  dataIndex: 'description',
 },
 {
  title: '类型1',
  dataIndex: 'category1',
  formType: 'cascader',
  formProps: {
   options: _queryCategorys,
  },
 },
 {
  title: '类型2',
  dataIndex: 'category2',
  formType: 'cascader',
  formProps: {
   options: _queryCategorys,
  },
 },
 {
  title: '文档数',
  dataIndex: 'docCount',
 },
 {
  title: '阅读数',
  dataIndex: 'viewCount',
 },
 {
  title: '点赞数',
  dataIndex: 'voteCount',
 },
 {
  title: '更新时间',
  dataIndex: 'updateTime',
  hideForm: true,
 }
]

const Book: React.FC = () => {
 return (
  <MyTable
   onAdd={_addBook}
   queryProps={{
    request: _queryBooks,
    pageSize: 10,
   }}
   onUpdate={_updateBook}
   columns={_columns}
   onRemove={_removeBooks}
  />
 )
}

export default React.memo<React.FC>(Book)

const _queryBooks = (params: QueryPagination) => request({
 method: 'GET',
 url: '/api/book/list',
 params,
})

const _addBook = (book: IBook) => request({
 method: 'POST',
 url: '/api/book/add',
 data: book,
})

const _removeBooks = (ids: number[]) => request({
 method: 'POST',
 url: '/api/book/remove',
 data: ids,
})

const _updateBook = (data: IBook, oldData: IBook) => request({
 method: 'POST',
 url: '/api/book/update',
 data: {
  id: oldData.id,
  ...data as any,
 },
}).then(console.log)
