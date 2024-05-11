import {
  PutItemCommand,
  PutItemCommandInput,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { useEffect, useState } from "react";
import { ddbClient } from "../aws";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export type DataType = {
  landingId: number;
  landingName: string;
};

export const useGetLandingList = () => {
  const [data, setData] = useState<DataType[]>([]);

  const fetchData = async () => {
    const params: ScanCommandInput = {
      TableName: "landingsList",
    };

    try {
      const response = await ddbClient.send(new ScanCommand(params));
      const buffer = response.Items?.map((e) => unmarshall(e)) as DataType[];
      console.log(buffer);

      setData(buffer);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data };
};

export const useAddLanding = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addLanding = async (landing: DataType) => {
    const params: PutItemCommandInput = {
      TableName: "landingsList",
      Item: {
        landingId: {
          N: `${landing.landingId}`,
        },
        landingName: {
          S: landing.landingName,
        },
      },
    };

    try {
      setIsLoading(true);
      const response = await ddbClient.send(new PutItemCommand(params));
      console.log(response);
      setIsLoading(false);
      setIsSuccess(true);
    } catch (e) {
      setIsError(true);
      console.error(e);
      alert(e);
    }
  };
  return { addLanding, isSuccess, isError, isLoading };
};
