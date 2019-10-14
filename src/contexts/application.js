import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from 'react'
import { useWeb3Context } from 'web3-react'
import { safeAccess } from '../utils'

const BLOCK_NUMBER = 'BLOCK_NUMBER'
const UPDATE_BLOCK_NUMBER = 'UPDATE_BLOCK_NUMBER'

const applicationContext = createContext()

function useApplicationContext() {
  return useContext(applicationContext)
}

const initialState = {
  [BLOCK_NUMBER]: {},
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_BLOCK_NUMBER: {
      const { networkId, blockNumber } = payload
      return {
        ...state,
        [BLOCK_NUMBER]: {
          ...(safeAccess(state, [BLOCK_NUMBER]) || {}),
          [networkId]: blockNumber,
        },
      }
    }
    default: {
      throw new Error(
        `Unexpected action type in ApplicationContext reducer: '${type}'.`,
      )
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const updateBlockNumber = useCallback((networkId, blockNumber) => {
    dispatch({ type: UPDATE_BLOCK_NUMBER, payload: { networkId, blockNumber } })
  }, [])

  const value = useMemo(() => [state, { updateBlockNumber }], [
    state,
    updateBlockNumber,
  ])

  return (
    <applicationContext.Provider value={value}>
      {children}
    </applicationContext.Provider>
  )
}

export function Updater() {
  const { networkId, library } = useWeb3Context()
  const [, { updateBlockNumber }] = useApplicationContext()

  useEffect(() => {
    if (library) {
      let stale = false
      function update() {
        library.eth
          .getBlockNumber()
          .then(blockNumber => {
            if (!stale) {
              updateBlockNumber(networkId, blockNumber)
            }
          })
          .catch(() => {
            if (!stale) {
              updateBlockNumber(networkId, null)
            }
          })
      }

      update()
      const subscription = library.eth.subscribe('newBlockHeaders')
      subscription.on('data', update)

      return () => {
        stale = true
        subscription.unsubscribe()
      }
    }
  }, [networkId, library, updateBlockNumber])

  return null
}

export function useBlockNumber() {
  const { networkId } = useWeb3Context()

  const [state] = useApplicationContext()

  return safeAccess(state, [BLOCK_NUMBER, networkId])
}
