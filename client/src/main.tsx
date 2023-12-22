import React from 'react'
import ReactDOM from 'react-dom/client'
import './globals.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Index from './pages/Index'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import TxnDetail from './pages/TxnDetail'

const router = createBrowserRouter([
  {
    path: "/group-4/client",
    element: <Index />,
  },
  {
    path: '/group-4/client/:txnId',
    element: <TxnDetail />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
