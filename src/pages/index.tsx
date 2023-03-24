import { InfluxDB } from "@influxdata/influxdb-client";
import { Button, Loader } from "@mantine/core";
import { useState } from "react";
import { useQuery } from "react-query";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

const token = process.env.NEXT_PUBLIC_INFLUX_TOKEN!;
const org = process.env.NEXT_PUBLIC_INFLUX_ORG!;
const url = process.env.NEXT_PUBLIC_INFLUX_URL!;

const Home = () => {
  const [queryClient] = useState(() => new InfluxDB({ url, token }));
  const [range, setRange] = useState(48);
  const { isLoading, data, refetch } = useQuery(
    ["influxData", range],
    () =>
      queryClient
        .getQueryApi(org)
        .collectRows(
          `from(bucket: "puregymbucket") |> range(start: -${range}h) |> filter(fn: (r) => r._field== "People")`
        ),
    { refetchInterval: 600000 } // set refetch interval to 10 minutes
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-8 p-6">
        <h1 className="text-3xl font-bold text-white">PureGym Logger</h1>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2E3440" />
            <YAxis
              tickFormatter={(value) => {
                return value;
              }}
              stroke="#D8DEE9"
            />
            <Line
              type="monotone"
              dataKey="_value"
              stroke="#81A1C1"
              strokeWidth={3}
              dot={false}
            />
            <Brush
              dataKey="_time"
              height={30}
              stroke="#81A1C1"
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
              }}
            />
            <Tooltip
              formatter={(value, name, props) => {
                const date = new Date(props.payload?._time);
                return date.toLocaleString();
              }}
              labelFormatter={() => ""}
              contentStyle={{
                backgroundColor: "#2E3440",
                border: "none",
                boxShadow: "0 5px 10px rgba(0, 0, 0, 0.25)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex w-full justify-center">
          <Button
            onClick={() => {
              setRange(48);
              refetch();
            }}
            className="mt-8 w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
