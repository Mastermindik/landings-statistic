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
  hoursFormatted,
  filterPageInPercent,
  filterPageInCount,
  countUsersInPeriod,
} from "./feachers";
import { ddbClient } from "./aws";
import { LandingStatisticType } from "./types";
import { leavingPages } from "./constant";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/uk';
console.log(current.length);

function App() {
  const [id, setId] = useState("");
  const [data, setData] = useState<LandingStatisticType[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  // console.log(new Date(startOfDayTimestamp));
  console.log(date?.toDate());
  console.log(date?.toDate().getTime());
  
  console.log(dayjs("2024-03-03").startOf("day").toDate().getTime());

  const minTimestamp = date?.startOf("day").toDate().getTime();
  console.log(minTimestamp);
  
  const maxTimestamp =date?.endOf("day").toDate().getTime();
  console.log(maxTimestamp);

  async function getItems() {
      const params: ScanCommandInput = {
        TableName: "LandingsUserStatistic",
        Limit: 9680,
        FilterExpression:
          "myTimestamp BETWEEN :minTimestamp AND :maxTimestamp AND landingId = :landingId",
        ExpressionAttributeValues: {
          ":landingId": {
            N: `${+id}`,
          },
          ":minTimestamp": {
            N: `${minTimestamp}`, // Мінімальний timestamp (у мілісекундах)
          },
          ":maxTimestamp": {
            N: `${maxTimestamp}`, // Максимальний timestamp (у мілісекундах)
          },
        },
      };
  
      try {
        const data = await ddbClient.send(new ScanCommand(params));
        setTotalUsers(data.Count ? data.Count : 0);
        const arr = data.Items?.map((e) => unmarshall(e)) as LandingStatisticType[];
        setData(arr );

        if (data?.LastEvaluatedKey?.id?.S?.length) {
          more(data?.LastEvaluatedKey?.id?.S)
        }
        
      } catch (err) {
        console.log(err);
      }
    
  }
  async function more(lastEvaluatedKey: string) {
    const params: ScanCommandInput = {
      TableName: "LandingsUserStatistic",
      Limit: 9680,
      ExclusiveStartKey: {
        id: {
          S: lastEvaluatedKey
        },
      },
      FilterExpression:
        "myTimestamp BETWEEN :minTimestamp AND :maxTimestamp AND landingId = :landingId",
      ExpressionAttributeValues: {
        ":landingId": {
          N: `${+id}`,
        },
        ":minTimestamp": {
          N: `${minTimestamp}`, // Мінімальний timestamp (у мілісекундах)
        },
        ":maxTimestamp": {
          N: `${maxTimestamp}`, // Максимальний timestamp (у мілісекундах)
        },
      },
    };

    try {
      const data = await ddbClient.send(new ScanCommand(params));
      setTotalUsers(state => data.Count ? state + data.Count : 0);
      const arr = data.Items?.map((e) => unmarshall(e)) as LandingStatisticType[];
      setData(state => [...state, ...arr] );
      if (data?.LastEvaluatedKey?.id?.S?.length) {
        more(data?.LastEvaluatedKey?.id?.S)
      }
      
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
          <InputLabel>Тимчасово працює лише на сьогоднішню дату</InputLabel>
          <Select
            label="Тимчасово працює лише на сьогоднішню дату"
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
        <LocalizationProvider  dateAdapter={AdapterDayjs} adapterLocale="uk" >
          <DatePicker className="item" label={"Date"} value={date} onChange={newDate => setDate(newDate)} maxDate={dayjs()} />
        </LocalizationProvider>
        <Button
          className="item"
          size="large"
          variant="contained"
          disabled={!id}
          onClick={() => getItems()}
        >
          Search
        </Button>
      </div>
      {!data.length ? (
        <b>Трафіку за цією сторінкою сьогдні немає</b>
      ) : (
        <>
          <b>Загальна кількість користувачів за добу: {totalUsers} </b>
          <b>
            Кількість користувачів за обраний час:{" "}
            {countUsersInPeriod(data, startTime, endTime)}
          </b>
          {leavingPages.map((e, i) => (
            <div className="stage" key={i}>
              <b>{e}:</b>
              <span className="counter">{filterPageInPercent(data, e, startTime, endTime)}</span>
              <span className="counter">{filterPageInCount(data, e, startTime, endTime)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
