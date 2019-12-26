import React from 'react'
import Web3Provider from 'web3-react'
import Web3 from 'web3'
import ApplicationContextProvider, {
  Updater as ApplicationContextUpdater,
} from './contexts/application'
import TransactionContextProvider, {
  Updater as TransactionContextUpdater,
} from './contexts/transaction'
import NetworkOnlyConnector from './connectors/NetworkOnlyConnector'
import InjectedConnector from './connectors/InjectedConnector'
import ThemeProvider, { GlobalStyle } from './themes'
import Router from './Router'

const Network = new NetworkOnlyConnector({
  providerURL: process.env.REACT_APP_NETWORK_URL || '',
  supportedNetworks: [Number(process.env.REACT_APP_NETWORK_ID || '1')],
})

const Injected = new InjectedConnector({
  supportedNetworks: [Number(process.env.REACT_APP_NETWORK_ID || '1')],
})

const connectors = { Injected, Network }

function ContextProviders({ children }) {
  return (
    <ApplicationContextProvider>
      <TransactionContextProvider>{children}</TransactionContextProvider>
    </ApplicationContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <ApplicationContextUpdater />
      <TransactionContextUpdater />
    </>
  )
}

function App() {
  return (
    <Web3Provider connectors={connectors} libraryName='web3.js' web3Api={Web3}>
      <ContextProviders>
        <Updaters />
        <ThemeProvider>
          <GlobalStyle />
          <Router />
        </ThemeProvider>
      </ContextProviders>
    </Web3Provider>
  )
}

export default App
