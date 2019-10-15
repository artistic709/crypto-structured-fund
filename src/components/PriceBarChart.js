import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  YAxis,
  Label,
} from 'recharts'

export default function PriceBarChart(props) {
  const { data } = props
  const { fullProfitPrice, lossPrice, currentPrice } = data
  return (
    <ResponsiveContainer>
      <BarChart data={[data]} barSize={40} barGap={40}>
        <YAxis
          stroke='#FFFFFF'
          width={80}
          padding={{ top: 30, bottom: 30 }}
          axisLine={false}
          tickLine={false}
          tick={{ fontWeight: 500 }}
        >
          <Label
            value='ETH Price'
            offset={10}
            position='insideLeft'
            style={{ textAnchor: 'middle' }}
            angle={-90}
            fill='#FFFFFF'
            fontWeight={500}
          />
        </YAxis>
        <Bar dataKey='currentPrice' fill='#00C8FF' />
        <Bar dataKey='fullProfitPrice' fill='#00FF8C' />
        <Bar dataKey='lossPrice' fill='#FF4D53' />
        <ReferenceLine
          y={fullProfitPrice}
          stroke='#FF4D53'
          strokeDasharray='5 5'
        >
          <Label
            value='Profit Price'
            fill='#FFFFFF'
            fontWeight={500}
            position='insideRight'
          />
        </ReferenceLine>
        <ReferenceLine y={lossPrice} stroke='#FF4D53' strokeDasharray='5 5'>
          <Label
            value='Break Even'
            fill='#FFFFFF'
            fontWeight={500}
            position='insideRight'
          />
        </ReferenceLine>
        <ReferenceLine
          y={currentPrice}
          label='Current Price'
          stroke='#FF4D53'
          strokeDasharray='5 5'
        >
          <Label
            value='Current Price'
            fill='#FFFFFF'
            fontWeight={500}
            position='insideRight'
          />
        </ReferenceLine>
      </BarChart>
    </ResponsiveContainer>
  )
}
