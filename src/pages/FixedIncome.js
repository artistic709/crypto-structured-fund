import React, { useMemo, useState, useCallback } from 'react'
import { useWeb3Context } from 'web3-react'
import { useTransactionAdder } from '../contexts/transaction'
import {
  usePriceConvertionRate,
  useDaiBalance,
  useDaiAllowance,
} from '../hooks/ethereum'
import {
  useRate,
  useDaiPool,
  useDaiInvestorAmount,
  useDaiFundUnits,
  useDaiFundPurchase,
  useDaiFundRedeem,
  useEthPool,
  useFundDates,
} from '../hooks/fund'
import { amountFormatter, dateFormatter } from '../utils'
import { Container, Row, SubRow, Spacer } from '../themes/layout'
import {
  Headline,
  Title,
  SubTitle,
  StrongText,
  Bold,
} from '../themes/typography'
import {
  PurchaseBlock,
  PurchaseInfo,
  DataBlock,
  DateBlock,
} from '../themes/block'
import {
  PurchaseForm,
  PurchaseInputField,
  PurchaseButton,
} from '../themes/form'
import PriceBarChart from '../components/PriceBarChart'
import BigNumber from 'bignumber.js'

export default function FixedIncome() {
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
    const approve = await daiApprove()
    approve
      .on('transactionHach', () => {
        setDaiApprovePending(true)
      })
      .on('receipt', () => {
        setDaiApprovePending(false)
      })
      .on('error', () => {
        setDaiApprovePending(false)
      })
  }, [daiApprove])

  const onPurchase = useCallback(async () => {
    const amountParsed = new BigNumber(amount).times(1e18).toString()
    const purchase = await purchaseDaiFund(amountParsed)
    purchase
      .on('transactionHash', hash => {
        addTransaction(hash)
      })
      .on('error', () => {
        setAmount('')
      })
  }, [purchaseDaiFund, amount, addTransaction])

  const onRedeem = useCallback(async () => {
    const amountParsed = new BigNumber(amount).times(1e18).toString()
    const redeem = await redeemDaiFund(amountParsed)
    redeem
      .on('transactionHash', hash => {
        addTransaction(hash)
      })
      .on('error', () => {
        setAmount('')
      })
  }, [redeemDaiFund, amount, addTransaction])

  const canPurchase = Date.now() < purchaseExpiringDate

  const canRedeem = Date.now() > redeemStartingDate

  const renderPurchaseButton = () => {
    if (!daiAllowance) {
      return <PurchaseButton disabled>Purchase</PurchaseButton>
    } else if (daiAllowance.lt(amount)) {
      return (
        <PurchaseButton onClick={onApprove} disabled={!connected}>
          Unlock
        </PurchaseButton>
      )
    } else if (daiApprovePending) {
      return <PurchaseButton disabled>Pending...</PurchaseButton>
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
        <PurchaseBlock>
          <PurchaseInfo>
            <Title>
              <Bold>
                Already Bought{' '}
                {daiFundUnits ? amountFormatter(daiFundUnits, 18) : '0'} units.
              </Bold>
            </Title>
            <SubTitle>
              Your Balance: {daiBalance ? amountFormatter(daiBalance, 18) : '-'}{' '}
              DAI
            </SubTitle>
          </PurchaseInfo>
          {renderPurchaseForm()}
        </PurchaseBlock>
      </Row>
      <Row>
        <DataBlock>
          <Title>Profit Rate</Title>
          <StrongText>
            {rate ? `${rate.times(100).toString()}%` : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Pool</Title>
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
        <Headline>Estimated Ether Price that you will get...</Headline>
        <Spacer />
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
      <Row>
        <DateBlock>
          <div className='date-info'>
            <Title center>Purchase Expiring Date</Title>
            <Title>
              <Bold>
                {purchaseExpiringDate
                  ? dateFormatter(purchaseExpiringDate)
                  : '-'}
              </Bold>
            </Title>
          </div>
          <div className='date-info'>
            <Title center>Redeption Starting Date</Title>
            <Title>
              <Bold>
                {redeemStartingDate ? dateFormatter(redeemStartingDate) : '-'}
              </Bold>
            </Title>
          </div>
        </DateBlock>
      </Row>
    </Container>
  )
}
