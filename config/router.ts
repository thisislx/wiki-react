export interface Router {
 name: string
 /** path 路径自动前缀 @/pages  */
 path: string
 component: string
 children?: Router[]
}

const routers: Router[] = [
 {
  name: '首页',
  path: '/Book',
  component: '/Book', 
 },
 {
  name: '分类',
  path: '/cagegory',
  component: '/Category',
 },
]

export default routers