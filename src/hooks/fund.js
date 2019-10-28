import { useCallback, useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react'
import { useContract, useGasPrice } from './ethereum'
import { useBlockNumber } from '../contexts/application'
import {
  CRYPTO_STRUCTURED_FUND_ADDRESSES,
  CRYPTO_STRUCTURED_FUND_CREATION_BLOCK,
} from '../constants'
import CRYPTO_STRUCTURED_FUND_ABI from '../constants/abis/cryptoStructuredFund.json'
import BigNumber from 'bignumber.js'

export function useFundContract() {
  const { networkId } = useWeb3Context()
  return useContract(
    CRYPTO_STRUCTURED_FUND_ADDRESSES[networkId],
    CRYPTO_STRUCTURED_FUND_ABI,
  )
}

export function useRate() {
  const fundContract = useFundContract()
  const [rate, setRate] = useState()

  useEffect(() => {
    fundContract.methods
      .rate()
      .call()
      .then(result => {
        setRate(new BigNumber(result).div(1e18))
      })
      .catch(() => {
        setRate()
      })
  }, [fundContract])

  return rate
}

export function useFundDates() {
  const fundContract = useFundContract()
  const [purchaseExpiringDate, setPurchaseExpiringDate] = useState()
  const [redeemStartingDate, setRedeemStartingDate] = useState()

  useEffect(() => {
    Promise.all([
      fundContract.methods.startBuy().call(),
      fundContract.methods.startSell().call(),
    ])
      .then(([startBuy, startSell]) => {
        setPurchaseExpiringDate(new BigNumber(startBuy).times(1000).toNumber())
        setRedeemStartingDate(new BigNumber(startSell).times(1000).toNumber())
      })
      .catch(() => {
        setPurchaseExpiringDate()
        setRedeemStartingDate()
      })
  }, [fundContract])

  return { purchaseExpiringDate, redeemStartingDate }
}

export function useDaiInvestorAmount() {
  const fundContract = useFundContract()
  const blockNumber = useBlockNumber()
  const [amount, setAmount] = useState()

  useEffect(() => {
    fundContract
      .getPastEvents('Deposit', {
        fromBlock: CRYPTO_STRUCTURED_FUND_CREATION_BLOCK,
      })
      .then(
        events =>
          events
            .map(event => event.returnValues.depositor)
            .filter((depositor, i, arr) => arr.indexOf(depositor) === i).length,
      )
      .then(result => {
        setAmount(result)
      })
      .catch(() => {
        setAmount()
      })
  }, [fundContract, blockNumber])

  return amount
}

export function useDaiPool() {
  const fundContract = useFundContract()
  const blockNumber = useBlockNumber()
  const [pool, setPool] = useState()

  useEffect(() => {
    fundContract.methods
      .totalSupply()
      .call()
      .then(result => {
        setPool(new BigNumber(result))
      })
      .catch(() => {
        setPool()
      })
  }, [fundContract, blockNumber])

  return pool
}

export function useDaiFundUnits() {
  const { account } = useWeb3Context()
  const fundContract = useFundContract()
  const [balance, setBalance] = useState()

  useEffect(() => {
    fundContract.methods
      .balanceOf(account)
      .call()
      .then(result => {
        setBalance(new BigNumber(result))
      })
      .catch(() => {
        setBalance()
      })
  }, [fundContract, account])

  return balance
}

export function useDaiFundPurchase() {
  const { account } = useWeb3Context()
  const fundContract = useFundContract()
  const { getPrice } = useGasPrice()

  return useCallback(
    async (amount, onTransactionHash, onConfirmation, onError) => {
      const deposit = fundContract.methods.deposit(amount)
      const estimatedGas = await deposit.estimateGas()
      const gas = new BigNumber(estimatedGas).times(1.5).toFixed(0)
      const gasPrice = await getPrice()

      return deposit
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
    [fundContract, account, getPrice],
  )
}

export function useDaiFundRedeem() {
  const { account } = useWeb3Context()
  const fundContract = useFundContract()
  const { getPrice } = useGasPrice()

  return useCallback(
    async (amount, onTransactionHash, onConfirmation, onError) => {
      const withdraw = fundContract.methods.withdraw(amount)
      const estimatedGas = await withdraw.estimateGas()
      const gas = new BigNumber(estimatedGas).times(1.5).toFixed(0)
      const gasPrice = await getPrice()

      return withdraw
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
    [account, fundContract, getPrice],
  )
}

export function useEthInvestorAmount() {
  const fundContract = useFundContract()
  const blockNumber = useBlockNumber()
  const [amount, setAmount] = useState()

  useEffect(() => {
    fundContract
      .getPastEvents('Invest', {
        fromBlock: CRYPTO_STRUCTURED_FUND_CREATION_BLOCK,
      })
      .then(
        events =>
          events
            .map(event => event.returnValues.investor)
            .filter((investor, i, arr) => arr.indexOf(investor) === i).length,
      )
      .then(result => {
        setAmount(result)
      })
      .catch(() => {
        setAmount()
      })
  }, [fundContract, blockNumber])

  return amount
}

export function useEthPool() {
  const fundContract = useFundContract()
  const blockNumber = useBlockNumber()
  const [pool, setPool] = useState()

  useEffect(() => {
    fundContract.methods
      .totalInvestment()
      .call()
      .then(result => {
        setPool(new BigNumber(result))
      })
      .catch(() => {
        setPool()
      })
  }, [fundContract, blockNumber])

  return pool
}

export function useEthFundUnits() {
  const { account } = useWeb3Context()
  const fundContract = useFundContract()
  const [balance, setBalance] = useState()

  useEffect(() => {
    fundContract.methods
      .investmentOf(account)
      .call()
      .then(result => {
        setBalance(new BigNumber(result))
      })
      .catch(() => {
        setBalance()
      })
  }, [fundContract, account])

  return balance
}

export function useEthFundPurchase() {
  const { account } = useWeb3Context()
  const fundContract = useFundContract()
  const { getPrice } = useGasPrice()

  return useCallback(
    (amount, onTransactionHash, onConfirmation, onError) => {
      const invest = fundContract.methods.invest()

      return Promise.all([
        invest.estimateGas({ value: amount }),
        getPrice(),
      ]).then(([estimatedGas, gasPrice]) => {
        const gas = new BigNumber(estimatedGas).times(1.5).toFixed(0)

        return invest
          .send({
            from: account,
            value: amount,
            gas,
            gasPrice,
          })
          .on('transactionHash', onTransactionHash)
          .on('confirmation', (number, receipt) => {
            if (number === 1) onConfirmation(receipt)
          })
          .on('error', onError)
      })
    },
    [fundContract, account, getPrice],
  )
}

export function useEthFundRedeem() {
  const { account } = useWeb3Context()
  const fundContract = useFundContract()
  const { getPrice } = useGasPrice()

  return useCallback(
    (amount, onTransactionHash, onConfirmation, onError) => {
      const redeem = fundContract.methods.redeem(amount)

      return Promise.all([redeem.estimateGas(), getPrice()]).then(
        ([estimatedGas, gasPrice]) => {
          const gas = new BigNumber(estimatedGas).times(1.5).toFixed(0)

          return redeem
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
      )
    },
    [account, fundContract, getPrice],
  )
}
