import React, { lazy, Suspense, useMemo } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
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
    {
     routerJSX
    }
   </BrowserRouter>
  </Suspense>
 )
}