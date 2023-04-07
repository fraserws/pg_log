import { InfluxDB } from "@influxdata/influxdb-client";
import { Loader } from "@mantine/core";
import moment from "moment";
import { useState } from "react";
import { useQuery } from "react-query";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Row {
  _time: string;
  _value: number;
}
//todo remove _value

const token = process.env.NEXT_PUBLIC_INFLUX_TOKEN;
const org = process.env.NEXT_PUBLIC_INFLUX_ORG;
const url = process.env.NEXT_PUBLIC_INFLUX_URL;

if (!token || !org || !url) {
  throw new Error("Missing InfluxDB credentials");
}

const Home = () => {
  const [queryClient] = useState(() => new InfluxDB({ url, token }));
  const [range, setRange] = useState<number>(48);
  const { isLoading, data } = useQuery<Row[]>(
    ["influxData", range],
    async () => {
      if (!org || !range) return [];
      const result = await queryClient
        .getQueryApi(org)
        .collectRows<Row>(
          `from(bucket: "puregymbucket") |> range(start: -${range}h) |> filter(fn: (r) => r._field == "People")`
        );
      return result;
    }
    // Return void from the promise function because useQuery expects it
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
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={data || []}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2E3440"
              className="pt-10"
            />
            <YAxis
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value: number) => value.toFixed(0)}
              stroke="#82A1C1"
            />
            <XAxis dataKey="_time" />
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
              // Cast the value argument to string
              tickFormatter={(value: string | number | Date) => {
                if (typeof value === "string") {
                  const date = new Date(value);
                  console.log(date);
                  return date.toLocaleTimeString();
                }
                return value.toLocaleString();
              }}
            />
            <Tooltip
              labelFormatter={(value: string) => {
                return moment(value).format("ddd MMM DD HH:mm");
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Home;
