import { InfluxDB } from "@influxdata/influxdb-client";
import { useState } from "react";
import { useQuery } from "react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";

const Home = () => {
  const token = process.env.INFLUX_TOKEN!;
  const org = process.env.INFLUX_ORG!;
  const url = process.env.INFLUX_URL!;

  const [queryClient] = useState(() => new InfluxDB({ url, token }));
  const { isLoading, data } = useQuery(
    "influxData",
    () =>
      queryClient
        .getQueryApi(org)
        .collectRows(
          `from(bucket: "puregymbucket") |> range(start: -96h) |> filter(fn: (r) => r._field== "People")`
        ),
    { refetchInterval: 600000 } // set refetch interval to 10 minutes
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    //nord blue background
    <div className="h-screen bg-black">
      <div className="container mx-auto p-6">
        <h1 className="mb-8 text-3xl font-bold text-white">PureGym logger</h1>
        <p className="mb-4 text-lg"></p>
        <p className="mb-4 text-lg">
          Source: <a href="https://www.puregym.com/">PureGym</a>
        </p>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis />
            <Line
              type="monotone"
              dataKey="_value"
              //nord blue
              stroke="#81A1C1"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Home;
