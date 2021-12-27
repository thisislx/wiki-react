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
  path: '/',
  component: '/Book',
 },
 {
  name: '页面A',
  path: '/A',
  component: '/A',
 },
 {
  name: '页面B',
  path: '/B',
  component: '/B',
 }
]

export default routers