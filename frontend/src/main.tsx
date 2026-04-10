import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const RouterComponent = ((import.meta.env.VITE_ROUTER_MODE as string | undefined) === 'hash' ? HashRouter : BrowserRouter)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterComponent>
      <App />
    </RouterComponent>
  </React.StrictMode>
)
