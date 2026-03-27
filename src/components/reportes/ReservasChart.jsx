import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const ReservasChart = ({ data }) => {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="fecha" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" stroke="#1e293b" />
    </LineChart>
  );
};

export default ReservasChart;