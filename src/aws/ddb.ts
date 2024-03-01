import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const ddbClient = new DynamoDBClient({
  region: import.meta.env.VITE_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_ACCESSKEYID,
    secretAccessKey: import.meta.env.VITE_SECRETACCESSKEY,
  },
});