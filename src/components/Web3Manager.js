import React, { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useWeb3Context, Connectors } from 'web3-react'
import Web3 from 'web3'
import styled from 'styled-components'
import { ReactComponent as Loading } from '../assets/loading.svg'

const Center = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

const { Connector } = Connectors

function tryToSetConnector(setConnector, setError) {
  setConnector('Injected', { suppressAndThrowErrors: true }).catch(() => {
    setConnector('Network', { suppressAndThrowErrors: true }).catch(err => {
      setError(err)
    })
  })
}

export default function Web3Manager({ children }) {
  const { active, error, setConnector, setError } = useWeb3Context()

  useEffect(() => {
    if (!active && !error) {
      if (window.ethereum || window.web3) {
        if (isMobile) {
          tryToSetConnector(setConnector, setError)
        } else {
          const web3 = new Web3(window.ethereum)
          web3.eth.getAccounts(accounts => {
            if (accounts.length > 0) {
              tryToSetConnector(setConnector, setError)
            } else {
              setConnector('Network', { suppressAndThrowErrors: true }).catch(
                err => {
                  setError(err)
                },
              )
            }
          })
        }
      } else {
        setConnector('Network', { suppressAndThrowErrors: true }).catch(err => {
          setError(err)
        })
      }
    }
  }, [active, error, setConnector, setError])

  useEffect(() => {
    if (error) {
      if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
        setConnector('Network', { suppressAndThrowErrors: true }).catch(err => {
          setError(err)
        })
      }
    }
  })

  if (!active && !error) {
    return (
      <Center>
        <Loading />
      </Center>
    )
  } else if (error) {
    return <div>Unknown Error</div>
  } else {
    return children
  }
}
