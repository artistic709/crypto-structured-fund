import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../components/Header'
import Footer from '../components/Footer'
import NavigationTabs from '../components/NavigationTabs'

const TargetReturn = lazy(() => import('./TargetReturn'))
const RiskReturn = lazy(() => import('./RiskReturn'))

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export default function Interface() {
  return (
    <AppWrapper>
      <BrowserRouter>
        <Header />
        <NavigationTabs />
        <Suspense fallback={null}>
          <Switch>
            <Route
              exact
              strict
              path='/target-return'
              component={TargetReturn}
            />
            <Route exact strict path='/risk-return' component={RiskReturn} />
            <Redirect to='/target-return' />
          </Switch>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </AppWrapper>
  )
}
