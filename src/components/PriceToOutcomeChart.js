import React from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Label,
} from 'recharts'

function renderYAxisTick({ x, y, payload }) {
  const fill = payload.value === 100 ? '#F9FF2D' : '#FFFFFF'
  return (
    <text x={x - 10} y={y} fill={fill} width='80' textAnchor='middle'>
      {`${payload.value}%`}
    </text>
  )
}

function renderShape({ cx, cy, r, payload }) {
  const fill = payload.active ? '#F9FF2D' : '#00FF8C'
  return <circle cx={cx} cy={cy} r='4' fill={fill} />
}

export default function PriceToOutcomeChart(props) {
  const { data } = props
  const sorted = data.sort((a, b) => a.price - b.price)
  return (
    <ResponsiveContainer>
      <ScatterChart>
        <XAxis
          dataKey='price'
          type='number'
          domain={['dataMin', 'dataMax']}
          interval={0}
          stroke='#FFFFFF'
          height={50}
          padding={{ left: 30, right: 30 }}
          axisLine={{ strokeWidth: 2 }}
          tickLine={false}
          tick={{ fontWeight: 500 }}
          tickCount={10}
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
          dataKey='rate'
          type='number'
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
        <Scatter
          data={sorted}
          line={{ stroke: '#00FF8C', strokeWidth: 4 }}
          fill='#00FF8C'
          shape={renderShape}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
