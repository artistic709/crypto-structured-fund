import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Fund = lazy(() => import('./pages/Fund'))

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Switch>
          <Route exact strict path='/' component={Home} />
          <Route path='/fund' component={Fund} />
          <Redirect to='/' />
        </Switch>
      </Suspense>
    </BrowserRouter>
  )
}
