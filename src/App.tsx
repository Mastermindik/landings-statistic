import { useState } from "react";
import "./App.css";
import { ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { current } from "./constatns";
import {
  startOfDayTimestamp,
  hoursFormatted,
  filterPageInPercent,
  filterPageInCount,
  countUsersInPeriod,
} from "./feachers";
import { ddbClient } from "./aws";
import { LandingStatisticType } from "./types";
import { leavingPages } from "./constant";

function App() {
  const [id, setId] = useState("");
  const [data, setData] = useState<any>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  async function getItems() {
    const params: ScanCommandInput = {
      TableName: "LandingsUserStatistic",
      FilterExpression: "landingId = :landingId AND myTimestamp > :timestamp ",
      ExpressionAttributeValues: {
        ":landingId": {
          N: `${+id}`,
        },
        ":timestamp": {
          N: `${startOfDayTimestamp}`,
        },
      },
    };

    try {
      const data = await ddbClient.send(new ScanCommand(params));
      // setData(data.Items);
      setTotalUsers(data.Count ? data.Count : 0);
      console.log(data.Count);
      const arr = data.Items?.map((e) => unmarshall(e));
      console.log(arr);
      setData(arr as LandingStatisticType[]);
    } catch (err) {
      console.log(err);
    }
  }

  function setPeriod(period: string) {
    setStartTime(+period.split(" ")[0]);
    setEndTime(+period.split(" ")[1]);
  }

  return (
    <div className="container">
      <div className="selects">
        <FormControl className="item" variant="filled">
          <InputLabel id="demo-simple-select-label">Name</InputLabel>
          <Select
            label="Name"
            value={id}
            onChange={(e) => setId(e.target.value)}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
          >
            {current
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((e) => (
                <MenuItem value={e.id} key={e.id}>
                  {e.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl className="item" variant="filled">
          <InputLabel>Time</InputLabel>
          <Select
            label="Time"
            value={`${startTime} ${endTime}`}
            onChange={(e) => setPeriod(e.target.value.toString())}
          >
            <MenuItem value={`0 0`} key={0}>
              Full day
            </MenuItem>
            {hoursFormatted.map((e) => (
              <MenuItem value={`${e.start} ${e.end}`} key={e.start}>
                {e.startNew} - {e.endNew}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          className="item"
          size="large"
          variant="contained"
          disabled={!id}
          onClick={getItems}
        >
          Search
        </Button>
      </div>
      {!data.length ?
      <b>Трафіку за цією сторінкою сьогдні немає</b>
      : (
        <>
          <b>Загальна кількість користувачів за добу: {totalUsers} </b>
          <b>
            Кількість користувачів за обраний час:{" "}
            {countUsersInPeriod(data, startTime, endTime)}
          </b>
          {leavingPages.map((e, i) => (
            <div className="stage" key={i}  >
              <b>{e}:</b>
              <span>{filterPageInPercent(data, e, startTime, endTime)}</span>
              <span>{filterPageInCount(data, e, startTime, endTime)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
