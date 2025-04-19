import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

function BarChart({ data, index, categories, colors, valueFormatter, yAxisWidth = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} width={yAxisWidth} />
        <Tooltip formatter={(value: number) => (valueFormatter ? [valueFormatter(value)] : [value])} />
        <Legend />
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={colors[i % colors.length]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

function LineChart({ data, index, categories, colors, valueFormatter, yAxisWidth = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} width={yAxisWidth} />
        <Tooltip formatter={(value: number) => (valueFormatter ? [valueFormatter(value)] : [value])} />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

function PieChart({ data, index, category, colors, valueFormatter }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart width={400} height={400}>
        <Pie
          dataKey={category}
          isAnimationActive={false}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => (valueFormatter ? [valueFormatter(value)] : [value])} />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

import { Cell } from "recharts"
