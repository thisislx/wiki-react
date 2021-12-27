import React, { createContext } from 'react'
import { render } from 'react-dom'
import './App.less'
import models from './models'
import type { Models } from './models'
import Router from './Router'
import { hot } from 'react-hot-loader/root'
import { setConfig } from 'react-hot-loader'
import 'antd/dist/antd.css';

const NODE_ENV = process.env.NODE_ENV as NODE_ENV

export const Context = createContext({} as Models)

const App = () => {
 const values = models()

 return (
  <Context.Provider value={values}>
   <Router />
  </Context.Provider>
 )
}
const Root = NODE_ENV === 'development' ? hot(App) : App
NODE_ENV === 'development' && setConfig({ reloadHooks: false })

export default render(<Root />, document.getElementById('app'))



