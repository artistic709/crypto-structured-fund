import { useMemo, useEffect, useState, useCallback } from 'react'
import { useWeb3Context } from 'web3-react'
import BigNumber from 'bignumber.js'
import { useBlockNumber } from '../contexts/application'
import { getContract, getGasPrice, getPriceConvertionRate } from '../utils'
import { DAI_ADDRESSES, CRYPTO_STRUCTURED_FUND_ADDRESSES } from '../constants'
import DAI_ABI from '../constants/abis/DSToken.json'

export function useContract(address, abi, withSignerIfPossible = true) {
  const { account, library } = useWeb3Context()

  return useMemo(() => {
    try {
      return getContract(
        address,
        abi,
        library,
        withSignerIfPossible ? account : undefined,
      )
    } catch {
      return null
    }
  }, [address, abi, library, account, withSignerIfPossible])
}

export function useEthBalance() {
  const { account, library } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const [balance, setBalance] = useState()

  useEffect(() => {
    library.eth
      .getBalance(account)
      .then(result => {
        setBalance(new BigNumber(result))
      })
      .catch(() => {
        setBalance()
      })
  }, [account, library, blockNumber])

  return balance
}

export function useDaiBalance() {
  const { account, networkId } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const daiContract = useContract(DAI_ADDRESSES[networkId], DAI_ABI)
  const [balance, setBalance] = useState()

  useEffect(() => {
    daiContract.methods
      .balanceOf(account)
      .call()
      .then(result => {
        setBalance(new BigNumber(result))
      })
      .catch(() => {
        setBalance()
      })
  }, [account, blockNumber, daiContract])

  return balance
}

export function useDaiAllowance() {
  const { account, networkId } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const daiContract = useContract(DAI_ADDRESSES[networkId], DAI_ABI)
  const { getPrice } = useGasPrice()
  const [allowance, setAllowance] = useState()

  const approve = useCallback(
    async (onTransactionHash, onConfirmation, onError) => {
      const approveFund = daiContract.methods.approve(
        CRYPTO_STRUCTURED_FUND_ADDRESSES[networkId],
      )
      const gas = await approveFund.estimateGas()
      const gasPrice = await getPrice()

      return approveFund
        .send({
          from: account,
          gas,
          gasPrice,
        })
        .on('transactionHash', onTransactionHash)
        .on('confirmation', (number, receipt) => {
          if (number === 1) onConfirmation(receipt)
        })
        .on('error', onError)
    },
    [daiContract, getPrice, account, networkId],
  )

  useEffect(() => {
    daiContract.methods
      .allowance(account, CRYPTO_STRUCTURED_FUND_ADDRESSES[networkId])
      .call()
      .then(result => {
        setAllowance(new BigNumber(result))
      })
      .catch(() => {
        setAllowance()
      })
  }, [daiContract, account, networkId, blockNumber])

  return { allowance, approve }
}

export function useGasPrice() {
  const [level, setLevel] = useState('fast')
  const getPrice = useCallback(() => getGasPrice(level), [level])

  return { getPrice, setLevel }
}

export function usePriceConvertionRate(symbol, convert) {
  const [rate, setRate] = useState()

  useEffect(() => {
    getPriceConvertionRate(symbol, convert)
      .then(result => {
        setRate(new BigNumber(result))
      })
      .catch(() => {
        setRate()
      })
  }, [symbol, convert])

  return rate
}
