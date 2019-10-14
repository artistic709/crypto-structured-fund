import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../components/Header'
import Footer from '../components/Footer'
import NavigationTabs from '../components/NavigationTabs'

const FixedIncome = lazy(() => import('./FixedIncome'))
const RiskAppreciation = lazy(() => import('./RiskAppreciation'))

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
            <Route exact strict path='/target-income' component={FixedIncome} />
            <Route
              exact
              strict
              path='/risk-appreciation'
              component={RiskAppreciation}
            />
            <Redirect to='/fixed-income' />
          </Switch>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </AppWrapper>
  )
}
