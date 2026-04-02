import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function FraudTrendChart({ data }) {
  return (
    <LineChart width={500} height={300} data={data}>
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="frauds" stroke="#ff4d4f" />
    </LineChart>
  );
}