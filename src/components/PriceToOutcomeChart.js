import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
} from 'recharts'

const renderYAxisTick = ({ x, y, payload }) => {
  const fill = payload.value === 100 ? '#F9FF2D' : '#FFFFFF'
  return (
    <text x={x - 10} y={y} fill={fill} width='80' textAnchor='middle'>
      {`${payload.value}%`}
    </text>
  )
}

export default function PriceToOutcomeChart(props) {
  const { data } = props
  const sorted = data.sort((a, b) => a.price - b.price)
  return (
    <ResponsiveContainer>
      <LineChart data={sorted}>
        <XAxis
          dataKey='price'
          stroke='#FFFFFF'
          height={50}
          padding={{ left: 30, right: 30 }}
          axisLine={{ strokeWidth: 2 }}
          tickLine={false}
          tick={{ fontWeight: 500 }}
        >
          <Label
            value='ETH Price (USD)'
            offset={5}
            position='insideBottom'
            fill='#FFFFFF'
            fontWeight={500}
          />
        </XAxis>
        <YAxis
          stroke='#FFFFFF'
          width={80}
          padding={{ top: 30, bottom: 30 }}
          axisLine={false}
          tickLine={false}
          tick={renderYAxisTick}
          // tickFormatter={value => `${value}%`}
        >
          <Label
            value='Outcome / Current Price'
            offset={10}
            position='insideLeft'
            style={{ textAnchor: 'middle' }}
            angle={-90}
            fill='#FFFFFF'
            fontWeight={500}
          />
        </YAxis>
        <Line dataKey='rate' type='linear' stroke='#00FF8C' strokeWidth='4' />
      </LineChart>
    </ResponsiveContainer>
  )
}
