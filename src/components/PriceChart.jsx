import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

const PriceChart = ({ tickStream = [], entryPrice }) => {
  const data = tickStream.map((item) => ({
    time: new Date(item.epoch * 1000).toLocaleTimeString(),
    price: parseFloat(item.tick),
  }));

  return (
    <div className="w-full h-64 bg-white p-4 border border-gray-200 rounded-md">

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
          {entryPrice && (
            <ReferenceLine
              y={entryPrice}
              label={{ position: 'right', value: `Entry: ${entryPrice}`, fill: 'gray' }}
              stroke="red"
              strokeDasharray="3 3"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
