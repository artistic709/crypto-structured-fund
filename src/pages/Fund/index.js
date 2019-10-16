import React, { Suspense, lazy } from 'react'
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import NavigationTabs from '../../components/NavigationTabs'

const TargetReturn = lazy(() => import('./TargetReturn'))
const RiskReturn = lazy(() => import('./RiskReturn'))

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Space = styled.div`
  margin-top: 4rem;
  width: 100vw;
  background-color: transparent;
`

export default function Fund() {
  const { path } = useRouteMatch()

  return (
    <AppWrapper>
      <Header />
      <NavigationTabs />
      <Suspense fallback={null}>
        <Switch>
          <Route path={`${path}/target-return`} component={TargetReturn} />
          <Route path={`${path}/risk-return`} component={RiskReturn} />
          <Redirect to={`${path}/target-return`} />
        </Switch>
      </Suspense>
      <Space />
      <Footer />
    </AppWrapper>
  )
}
