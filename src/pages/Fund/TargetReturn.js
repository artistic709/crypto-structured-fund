import React, { useMemo, useState, useCallback } from 'react'
import { useWeb3Context } from 'web3-react'
import { useTransactionAdder } from '../../contexts/transaction'
import {
  usePriceConvertionRate,
  useDaiBalance,
  useDaiAllowance,
} from '../../hooks/ethereum'
import {
  useRate,
  useDaiPool,
  useDaiInvestorAmount,
  useDaiFundUnits,
  useDaiFundPurchase,
  useDaiFundRedeem,
  useEthPool,
  useFundDates,
} from '../../hooks/fund'
import { amountFormatter, dateFormatter } from '../../utils'
import { Container, Row, SubRow } from '../../themes/layout'
import {
  Headline,
  Title,
  SubTitle,
  Text,
  StrongText,
  Bold,
} from '../../themes/typography'
import {
  PurchaseBlock,
  PurchaseBlockTop,
  PurchaseBlockBottom,
  PurchaseInfo,
  PurchaseDate,
  DataBlock,
} from '../../themes/block'
import {
  PurchaseForm,
  PurchaseInputField,
  PurchaseButton,
} from '../../themes/form'
import PriceBarChart from '../../components/PriceBarChart'
import { ReactComponent as Item } from '../../assets/item.svg'
import BigNumber from 'bignumber.js'

export default function TargetReturn() {
  const { account } = useWeb3Context()

  const daiBalance = useDaiBalance()
  const { allowance: daiAllowance, approve: daiApprove } = useDaiAllowance()
  const [daiApprovePending, setDaiApprovePending] = useState(false)

  const { purchaseExpiringDate, redeemStartingDate } = useFundDates()
  const daiFundUnits = useDaiFundUnits()
  const rate = useRate()
  const daiPool = useDaiPool()
  const ethPool = useEthPool()
  const daiInvestorAmount = useDaiInvestorAmount()
  const daiToEthRate = usePriceConvertionRate('DAI', 'ETH')
  const currentEthPrice = usePriceConvertionRate('ETH', 'USD')

  const purchaseDaiFund = useDaiFundPurchase()
  const redeemDaiFund = useDaiFundRedeem()
  const addTransaction = useTransactionAdder()

  const [amount, setAmount] = useState('') // purchase amount

  const connected = useMemo(() => !!account, [account])

  const totalPoolInEth = useMemo(
    () =>
      daiPool && ethPool && daiToEthRate
        ? daiPool.times(daiToEthRate).plus(ethPool)
        : null,
    [daiPool, ethPool, daiToEthRate],
  )

  const priceToGetFullProfit = useMemo(
    () =>
      daiPool && totalPoolInEth ? daiPool.times(1.2).div(totalPoolInEth) : null,
    [daiPool, totalPoolInEth],
  )

  const priceToGetLoss = useMemo(
    () => (daiPool && totalPoolInEth ? daiPool.div(totalPoolInEth) : null),
    [daiPool, totalPoolInEth],
  )

  const chartData = useMemo(() => {
    const fullProfitPrice = priceToGetFullProfit
      ? priceToGetFullProfit.toNumber()
      : 0
    const lossPrice = priceToGetLoss ? priceToGetLoss.toNumber() : 0
    const currentPrice = currentEthPrice ? currentEthPrice.toNumber() : 0
    return {
      fullProfitPrice,
      lossPrice,
      currentPrice,
    }
  }, [priceToGetFullProfit, priceToGetLoss, currentEthPrice])

  const onApprove = useCallback(async () => {
    const onTransactionHash = hash => {
      addTransaction(hash)
      setDaiApprovePending(true)
    }
    const onConfirmation = () => {
      setDaiApprovePending(false)
    }
    const onError = () => {
      setDaiApprovePending(false)
    }
    daiApprove(onTransactionHash, onConfirmation, onError)
  }, [daiApprove, addTransaction])

  const onPurchase = useCallback(async () => {
    const amountParsed = new BigNumber(amount).times(1e18).toString()
    const onTransactionHash = hash => {
      addTransaction(hash)
    }
    const onConfirmation = () => {
      setAmount('')
    }
    const onError = () => {
      setAmount('')
    }
    purchaseDaiFund(amountParsed, onTransactionHash, onConfirmation, onError)
  }, [purchaseDaiFund, amount, addTransaction])

  const onRedeem = useCallback(async () => {
    const amountParsed = new BigNumber(amount).times(1e18).toString()
    const onTransactionHash = hash => {
      addTransaction(hash)
    }
    const onConfirmation = () => {
      setAmount('')
    }
    const onError = () => {
      setAmount('')
    }
    redeemDaiFund(amountParsed, onTransactionHash, onConfirmation, onError)
  }, [redeemDaiFund, amount, addTransaction])

  const canPurchase = Date.now() < purchaseExpiringDate

  const canRedeem = Date.now() > redeemStartingDate

  const renderPurchaseButton = () => {
    if (!daiAllowance || !amount) {
      return <PurchaseButton disabled>Purchase</PurchaseButton>
    } else if (daiApprovePending) {
      return <PurchaseButton disabled>Pending...</PurchaseButton>
    } else if (daiAllowance.lt(amount)) {
      return (
        <PurchaseButton onClick={onApprove} disabled={!connected}>
          Unlock
        </PurchaseButton>
      )
    } else {
      return (
        <PurchaseButton onClick={onPurchase} disabled={!connected}>
          Purchase
        </PurchaseButton>
      )
    }
  }

  const renderPurchaseForm = () => {
    if (canPurchase) {
      return (
        <PurchaseForm>
          <PurchaseInputField>
            <input
              type='number'
              placeholder='0.0'
              value={amount}
              onChange={event => {
                setAmount(event.target.value)
              }}
            />
            <span className='suffix'>DAI</span>
          </PurchaseInputField>
          {renderPurchaseButton()}
        </PurchaseForm>
      )
    } else if (canRedeem) {
      return (
        <PurchaseForm>
          <PurchaseInputField>
            <input
              type='number'
              placeholder='0.0'
              value={amount}
              onChange={event => {
                setAmount(event.target.value)
              }}
            />
            <span className='suffix'>ETH</span>
          </PurchaseInputField>
          <PurchaseButton onClick={onRedeem} disabled={!connected}>
            Redeem
          </PurchaseButton>
        </PurchaseForm>
      )
    } else {
      return (
        <PurchaseInfo>
          <SubTitle>The fund is in the locked period.</SubTitle>
        </PurchaseInfo>
      )
    }
  }

  return (
    <Container>
      <Row>
        <DataBlock strong>
          <Title>Profit Rate</Title>
          <StrongText>
            {rate ? `${rate.times(100).toString()}%` : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Pool (DAI)</Title>
          <StrongText>
            {daiPool ? amountFormatter(daiPool, 18) : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Investors</Title>
          <StrongText>{daiInvestorAmount || '-'}</StrongText>
        </DataBlock>
      </Row>
      <Row>
        <PurchaseBlock>
          <PurchaseBlockTop>
            <PurchaseInfo>
              <Title>
                <Bold>
                  Already Bought{' '}
                  {daiFundUnits ? amountFormatter(daiFundUnits, 18) : '0'}{' '}
                  units.
                </Bold>
              </Title>
              <SubTitle>
                Your Balance:{' '}
                {daiBalance ? amountFormatter(daiBalance, 18) : '-'} DAI
              </SubTitle>
            </PurchaseInfo>
            {renderPurchaseForm()}
          </PurchaseBlockTop>
          <PurchaseBlockBottom>
            <PurchaseDate>
              <div className='item'>
                <Item />
                <Text>
                  Purchase Due Date:{' '}
                  {purchaseExpiringDate
                    ? dateFormatter(purchaseExpiringDate)
                    : '-'}
                </Text>
              </div>
              <div className='item'>
                <Item />
                <Text>
                  Redeem Starting Date:{' '}
                  {redeemStartingDate ? dateFormatter(redeemStartingDate) : '-'}
                </Text>
              </div>
            </PurchaseDate>
          </PurchaseBlockBottom>
        </PurchaseBlock>
      </Row>
      <Row justifyBetween>
        <Headline>Estimated Ether Price that you will get...</Headline>
        <SubTitle>Unit: USD/ETH</SubTitle>
      </Row>
      <SubRow>
        <DataBlock>
          <Title>Current Price</Title>
          <StrongText>
            {currentEthPrice ? currentEthPrice.toFixed(2) : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Full Profits</Title>
          <StrongText>
            {priceToGetFullProfit ? priceToGetFullProfit.toFixed(2) : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Loss</Title>
          <StrongText>
            {priceToGetLoss ? priceToGetLoss.toFixed(2) : '-'}
          </StrongText>
        </DataBlock>
      </SubRow>
      <SubRow>
        <DataBlock>
          <div style={{ width: '90%', height: '300px' }}>
            <PriceBarChart data={chartData} />
          </div>
        </DataBlock>
      </SubRow>
    </Container>
  )
}
