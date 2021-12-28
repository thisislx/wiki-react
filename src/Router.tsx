import React, { lazy, Suspense, useMemo } from 'react'
import { Menu } from 'antd'
import { BrowserRouter, Route, useHistory } from 'react-router-dom'
import routerConfig from '@@/router'
import type { Router } from '@@/router'

const _lazy = (path: string) => lazy(() => import(`./pages${path}`))

export default () => {

 const routerJSX = useMemo(() => {
  const render = (route: Router) => (
   <Route
    path={route.path}
    component={_lazy(route.component)}
    key={route.path}
    exact
   >
    {
     route.children && route.children.map(child => render(child))
    }
   </Route>
  )
  return routerConfig.map(render)
 }, [])

 return (
  <Suspense fallback={<div>loading...</div>} >
   <BrowserRouter>
    <HeaderMenu routerConf={routerConfig} />
    {
     routerJSX
    }
   </BrowserRouter>
  </Suspense>
 )
}


const HeaderMenu = ({ routerConf }) => {
 const history = useHistory()
 return (
  <ul>
   {
    routerConf.map(rc => (
     <li onClick={() => history.push(rc.path)} key={rc.path}>
      {rc.path}
     </li>
    ))
   }
  </ul>
 )
}


