import React, { useMemo, useState, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3Context } from 'web3-react'
import { useTransactionAdder } from '../../contexts/transaction'
import { usePriceConvertionRate, useEthBalance } from '../../hooks/ethereum'
import {
  useDaiPool,
  useEthPool,
  useEthInvestorAmount,
  useEthFundUnits,
  useEthFundPurchase,
  useEthFundRedeem,
  useFundDates,
} from '../../hooks/fund'
import { amountFormatter, dateFormatter } from '../../utils'
import { Container, Row, SubRow, Spacer } from '../../themes/layout'
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
  USDInput,
  PurchaseForm,
  PurchaseInputField,
  PurchaseButton,
} from '../../themes/form'
import PriceToOutcomeChart from '../../components/PriceToOutcomeChart'
import { ReactComponent as Item } from '../../assets/item.svg'

export default function RiskReturn() {
  const { account } = useWeb3Context()

  const ethBalance = useEthBalance()
  const ethFundUnits = useEthFundUnits()
  const { purchaseExpiringDate, redeemStartingDate } = useFundDates()
  const daiPool = useDaiPool()
  const ethPool = useEthPool()
  const ethInvestorAmount = useEthInvestorAmount()
  const daiToEthRate = usePriceConvertionRate('DAI', 'ETH')
  const currentEthPrice = usePriceConvertionRate('ETH', 'USD')

  const purchaseEthFund = useEthFundPurchase()
  const redeemEthFund = useEthFundRedeem()
  const addTransaction = useTransactionAdder()

  const [amount, setAmount] = useState('') // purchase amount
  const [price, setPrice] = useState(500)

  const connected = useMemo(() => !!account, [account])

  const totalPoolInEth = useMemo(
    () =>
      daiPool && ethPool && daiToEthRate
        ? daiPool.times(daiToEthRate).plus(ethPool)
        : null,
    [daiPool, ethPool, daiToEthRate],
  )

  const leverage = useMemo(
    () => (totalPoolInEth && ethPool ? totalPoolInEth.div(ethPool) : null),
    [totalPoolInEth, ethPool],
  )

  const estimatedProfits = useMemo(() => {
    if (totalPoolInEth && price && daiPool && ethPool) {
      const profitPerUnit = totalPoolInEth
        .times(price)
        .minus(daiPool.times(1.2))
        .div(ethPool)
      return profitPerUnit.gt(0) ? profitPerUnit : new BigNumber(0)
    } else {
      return null
    }
  }, [totalPoolInEth, price, daiPool, ethPool])

  const estimatedProfitRate = useMemo(
    () =>
      estimatedProfits && currentEthPrice
        ? estimatedProfits.minus(currentEthPrice).div(currentEthPrice)
        : null,
    [estimatedProfits, currentEthPrice],
  )

  const chartData = useMemo(() => {
    if (daiPool && ethPool && totalPoolInEth && currentEthPrice) {
      const lose100PercentPrice = parseInt(
        daiPool
          .times(1.2)
          .div(totalPoolInEth)
          .toFixed(0),
      )
      const zeroProfitPrice = parseInt(
        ethPool
          .times(currentEthPrice)
          .plus(daiPool.times(1.2))
          .div(totalPoolInEth)
          .toFixed(0),
      )
      const trippleProfitPrice = parseInt(
        ethPool
          .times(currentEthPrice)
          .times(4)
          .plus(daiPool.times(1.2))
          .div(totalPoolInEth)
          .toFixed(0),
      )
      return [
        { price: lose100PercentPrice, rate: 0 },
        { price: zeroProfitPrice, rate: 100 },
        { price: trippleProfitPrice, rate: 400 },
        {
          price: price,
          rate: parseInt(estimatedProfitRate.times(100).toFixed(0)) + 100,
          active: true,
        },
      ]
    } else {
      return []
    }
  }, [
    daiPool,
    ethPool,
    totalPoolInEth,
    currentEthPrice,
    price,
    estimatedProfitRate,
  ])

  const onPurchase = useCallback(async () => {
    const amountParsed = new BigNumber(amount).times(1e18).toString()
    const purchase = await purchaseEthFund(amountParsed)
    purchase
      .on('transactionHash', hash => {
        addTransaction(hash)
      })
      .on('error', () => {
        setAmount('')
      })
  }, [purchaseEthFund, addTransaction, amount])

  const onRedeem = useCallback(async () => {
    const amountParsed = new BigNumber(amount).times(1e18).toString()
    const redeem = await redeemEthFund(amountParsed)
    redeem
      .on('transactionHash', hash => {
        addTransaction(hash)
      })
      .on('error', () => {
        setAmount('')
      })
  }, [redeemEthFund, amount, addTransaction])

  const canPurchase = Date.now() < purchaseExpiringDate

  const canRedeem = Date.now() > redeemStartingDate

  const renderForm = () => {
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
            <span className='suffix'>ETH</span>
          </PurchaseInputField>
          <PurchaseButton onClick={onPurchase} disabled={!connected}>
            Purchase
          </PurchaseButton>
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
          <Title>Leverage</Title>
          <StrongText>{leverage ? leverage.toFixed(2) : '-'}</StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Pool (ETH)</Title>
          <StrongText>
            {ethPool ? amountFormatter(ethPool, 18) : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Investors</Title>
          <StrongText>{ethInvestorAmount || '-'}</StrongText>
        </DataBlock>
      </Row>
      <Row>
        <PurchaseBlock>
          <PurchaseBlockTop>
            <PurchaseInfo>
              <Title>
                <Bold>
                  Already Bought{' '}
                  {ethFundUnits ? amountFormatter(ethFundUnits, 18) : '0'}{' '}
                  units.
                </Bold>
              </Title>
              <SubTitle>
                Your Balance:{' '}
                {ethBalance ? amountFormatter(ethBalance, 18) : '-'} ETH
              </SubTitle>
            </PurchaseInfo>
            {renderForm()}
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
      <Row>
        <Headline>
          Estimated Profits/unit if Ether hits USD
          <USDInput
            type='number'
            placeholder='200'
            value={price}
            onChange={event => {
              setPrice(event.target.value)
            }}
          />
        </Headline>
        <Spacer />
        <SubTitle>Unit: USD/ETH</SubTitle>
      </Row>
      <SubRow>
        <DataBlock>
          <Title>Outcomes</Title>
          <StrongText>
            {estimatedProfits ? estimatedProfits.toFixed(4) : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Profit Rate</Title>
          <StrongText>
            {estimatedProfitRate
              ? `${estimatedProfitRate.times(100).toFixed(0)}%`
              : '-'}
          </StrongText>
        </DataBlock>
        <DataBlock>
          <Title>Current Price</Title>
          <StrongText>
            {currentEthPrice ? currentEthPrice.toFixed(2) : '-'}
          </StrongText>
        </DataBlock>
      </SubRow>
      <SubRow>
        <DataBlock>
          <div style={{ width: '90%', height: '300px' }}>
            <PriceToOutcomeChart data={chartData} />
          </div>
        </DataBlock>
      </SubRow>
    </Container>
  )
}
