import React from 'react'
import MyTable, { Columns } from '@/components/MyTable'
import request from '@/request'
import type { IBook } from './data.d'
import styles from './index.less'
import { Card } from 'antd'

const _columns: Columns<IBook>[] = [
 {
  title: '名字',
  dataIndex: 'name',
 },
 {
  title: '类型1',
  dataIndex: 'category1',
 },
 {
  title: '类型2',
  dataIndex: 'category2',
 },
 {
  title: '描述',
  dataIndex: 'description',
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
 }
]

const Book: React.FC = () => {
 return (
  <Card className={styles.wrap}>
   <header>
    hello this is book
   </header>
   <MyTable
    onAdd={_addBook}
    queryProps={{
     request: _queryBooks,
     pageSize: 100,
    }}
    columns={_columns}
    onRemove={_removeBooks}
   />
  </Card>
 )
}

export default React.memo<React.FC>(Book)


const _queryBooks = (params: QueryPagination) => request({
 method: 'GET',
 url: '/api/book/list',
 params,
}).then(d => d.data)

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