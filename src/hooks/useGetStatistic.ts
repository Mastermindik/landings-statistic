import { useState } from "react";
import { LandingStatisticType } from "../types";
import { ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "../aws";

const REACT_ID = ["88333", "88275", "89060"];

export const useGetStatistic = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<LandingStatisticType[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  async function getStatistic(
    id: string,
    minTimestamp?: number,
    maxTimestamp?: number
  ) {
    setIsLoading(true);
    const params: ScanCommandInput = {
      TableName: REACT_ID.includes(id)
        ? "ReactLandings"
        : "LandingsUserStatistic",
      Limit: 9680,
      FilterExpression:
        "myTimestamp BETWEEN :minTimestamp AND :maxTimestamp AND landingId = :landingId",
      ExpressionAttributeValues: {
        ":landingId": {
          N: `${+id}`,
        },
        ":minTimestamp": {
          N: `${minTimestamp}`,
        },
        ":maxTimestamp": {
          N: `${maxTimestamp}`,
        },
      },
    };

    try {
      const data = await ddbClient.send(new ScanCommand(params));
      setTotalUsers(data.Count ? data.Count : 0);
      const arr = data.Items?.map((e) =>
        unmarshall(e)
      ) as LandingStatisticType[];
      setData(arr);

      if (data?.LastEvaluatedKey?.id?.S?.length) {
        more(data?.LastEvaluatedKey?.id?.S, id, minTimestamp, maxTimestamp);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function more(
    lastEvaluatedKey: string,
    id: string,
    minTimestamp?: number,
    maxTimestamp?: number
  ) {
    const params: ScanCommandInput = {
      TableName: REACT_ID.includes(id)
        ? "ReactLandings"
        : "LandingsUserStatistic",
      Limit: 9680,
      ExclusiveStartKey: {
        id: {
          S: lastEvaluatedKey,
        },
      },
      FilterExpression:
        "myTimestamp BETWEEN :minTimestamp AND :maxTimestamp AND landingId = :landingId",
      ExpressionAttributeValues: {
        ":landingId": {
          N: `${+id}`,
        },
        ":minTimestamp": {
          N: `${minTimestamp}`,
        },
        ":maxTimestamp": {
          N: `${maxTimestamp}`,
        },
      },
    };

    try {
      const data = await ddbClient.send(new ScanCommand(params));
      setTotalUsers((state) => (data.Count ? state + data.Count : state));
      const arr = data.Items?.map((e) =>
        unmarshall(e)
      ) as LandingStatisticType[];
      setData((state) => [...state, ...arr]);
      if (data?.LastEvaluatedKey?.id?.S?.length) {
        more(data?.LastEvaluatedKey?.id?.S, id, minTimestamp, maxTimestamp);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return { isLoading, data, totalUsers, getStatistic };
};
