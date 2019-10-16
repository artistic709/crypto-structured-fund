import React, { useState, useEffect } from 'react'
import { useWeb3Context, Connectors } from 'web3-react'
import { ethers } from 'ethers'
import styled from 'styled-components'
import { shortenAddress } from '../utils'

const { Connector } = Connectors

const AddressWrapper = styled.div`
  width: 8rem;
  height: 2.5rem;
  border: 2px solid ${({ theme }) => theme.eucalyptusGreen};
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.mirageBlue};
  color: ${({ theme }) => theme.textColor};
  font-size: 1rem;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;

  @media screen and (min-width: 600px) {
    width: 10rem;
    height: 3rem;
    font-size: 1.25rem;
  }
`

const ConnectButton = styled.button`
  width: 8rem;
  height: 2.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.eucalyptusGreen};
  color: ${({ theme }) => theme.textColor};
  font-size: 1rem;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  @media screen and (min-width: 600px) {
    width: 10rem;
    height: 3rem;
    font-size: 1.25rem;
  }
`

export default function Web3Status() {
  const { account, connectorName, setConnector } = useWeb3Context()

  const [error, setError] = useState()

  // logic to detect log{ins,outs}...
  useEffect(() => {
    const { ethereum } = window
    if (connectorName === 'Injected') {
      // ...poll to check the accounts array, and if it's ever 0 i.e. the user logged out, update the connector
      if (ethereum) {
        const accountPoll = setInterval(() => {
          const library = new ethers.providers.Web3Provider(ethereum)
          library.listAccounts().then(accounts => {
            if (accounts.length === 0) {
              setConnector('Network')
            }
          })
        }, 750)

        return () => {
          clearInterval(accountPoll)
        }
      }
    } else {
      if (
        connectorName === 'Network' &&
        ethereum &&
        ethereum.on &&
        ethereum.removeListener
      ) {
        function tryToActivateInjected() {
          const library = new ethers.providers.Web3Provider(window.ethereum)
          library.listAccounts().then(accounts => {
            if (accounts.length >= 1) {
              setConnector('Injected', { suppressAndThrowErrors: true })
                .then(() => {
                  setError()
                })
                .catch(error => {
                  // ...and if the error is that they're on the wrong network, display it, otherwise eat it
                  if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
                    setError(error)
                  }
                })
            }
          })
        }

        ethereum.on('networkChanged', tryToActivateInjected)
        ethereum.on('accountsChanged', tryToActivateInjected)

        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('networkChanged', tryToActivateInjected)
            ethereum.removeListener('accountsChanged', tryToActivateInjected)
          }
        }
      }
    }
  })

  const onClick = () => {
    if (connectorName === 'Network' && (window.ethereum || window.web3)) {
      setConnector('Injected', { suppressAndThrowErrors: true }).catch(err => {
        if (err.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
          setError(err)
        }
      })
    }
  }

  if (error) {
    return <div>Wrong Network</div>
  } else if (!account) {
    return <ConnectButton onClick={onClick}>Connect</ConnectButton>
  } else {
    return <AddressWrapper>{shortenAddress(account)}</AddressWrapper>
  }
}
