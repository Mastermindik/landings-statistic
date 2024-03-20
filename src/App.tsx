import { useState } from "react";
import "./App.css";
import { ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  Autocomplete,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { current } from "./constatns";
import {
  filterPageInPercent,
  filterPageInCount,
  countUsersInPeriod,
} from "./feachers";
import { ddbClient } from "./aws";
import { LandingStatisticType } from "./types";
import { leavingPages, leavingPagesFuel, newLeavingPages } from "./constant";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/uk";
import { useDayParts } from "./hooks/useDates";

// const DAY_X = dayjs('2024-03-14').endOf('day').toDate().getTime();

function App() {
  const [id, setId] = useState("");
  const [data, setData] = useState<LandingStatisticType[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const { dayParts, setCurrentDate } = useDayParts(date);
  const [autocompleteValue, setAutocompleteValue] = useState<null | string>(
    null
  );
  // console.log(new Date(startOfDayTimestamp));
  const minTimestamp = date?.startOf("day").toDate().getTime();

  const maxTimestamp = date?.endOf("day").toDate().getTime();

  async function getItemsOld() {
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
      const arr = data.Items?.map((e) =>
        unmarshall(e)
      ) as LandingStatisticType[];
      setData(arr);

      if (data?.LastEvaluatedKey?.id?.S?.length) {
        moreOld(data?.LastEvaluatedKey?.id?.S);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function moreOld(lastEvaluatedKey: string) {
    const params: ScanCommandInput = {
      TableName: "LandingsUserStatistic",
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
          N: `${minTimestamp}`, // Мінімальний timestamp (у мілісекундах)
        },
        ":maxTimestamp": {
          N: `${maxTimestamp}`, // Максимальний timestamp (у мілісекундах)
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
        moreOld(data?.LastEvaluatedKey?.id?.S);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function getItems() {
    const params: ScanCommandInput = {
      TableName: `ReactLandings`,
      Limit: 9680,
      FilterExpression: "myTimestamp BETWEEN :minTimestamp AND :maxTimestamp AND landingId = :landingId",
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
      const arr = data.Items?.map((e) =>
        unmarshall(e)
      ) as LandingStatisticType[];
      setData(arr);

      if (data?.LastEvaluatedKey?.id?.S?.length) {
        more(data?.LastEvaluatedKey?.id?.S);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function more(lastEvaluatedKey: string) {
    const params: ScanCommandInput = {
      TableName: `ReactLandings`,
      Limit: 9680,
      ExclusiveStartKey: {
        id: {
          S: lastEvaluatedKey,
        },
      },
      FilterExpression: "myTimestamp BETWEEN :minTimestamp AND :maxTimestamp AND landingId = :landingId",
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
      setTotalUsers((state) => (data.Count ? state + data.Count : state));
      const arr = data.Items?.map((e) =>
        unmarshall(e)
      ) as LandingStatisticType[];
      setData((state) => [...state, ...arr]);
      if (data?.LastEvaluatedKey?.id?.S?.length) {
        more(data?.LastEvaluatedKey?.id?.S);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function getData() {
    // if (date && DAY_X < date?.toDate().getTime()) {
    if (id === "88275") {
      getItems();
    } else {
      getItemsOld();
    }
  }

  function setPeriod(period: string) {
    setStartTime(+period.split(" ")[0]);
    setEndTime(+period.split(" ")[1]);
  }

  function aaa(newDate: dayjs.Dayjs | null) {
    setPeriod("0 0");
    setDate(newDate);
    setCurrentDate(newDate);
  }

  return (
    <div className="container">
      <div className="selects">
        {/* <FormControl className="item" variant="filled">
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
        </FormControl> */}
        <Autocomplete
          className="item"
          value={autocompleteValue}
          options={current.map((e) => e.name)}
          onChange={(_event: any, newValue: string | null) => {
            setAutocompleteValue(newValue);
            setId(
              newValue
                ? current.filter((e) => e.name === newValue)[0].id.toString()
                : ""
            );
          }}
          renderInput={(params) => <TextField {...params} label="Name" />}
        />
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
            {dayParts.map((e) => (
              <MenuItem value={`${e.start} ${e.end}`} key={e.start}>
                {e.startNew} - {e.endNew}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
          <DatePicker
            className="item"
            label={"Date"}
            value={date}
            onChange={(newDate) => aaa(newDate)}
            maxDate={dayjs()}
          />
        </LocalizationProvider>
        <Button
          className="item"
          size="large"
          variant="contained"
          disabled={!id}
          onClick={getData}
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
          {(id === "88275" ? newLeavingPages : id === "88238" ? leavingPagesFuel : leavingPages).map((e, i) => (
            <div className="stage" key={i}>
              <b>{e}:</b>
              <span className="counter">
                {filterPageInPercent(data, e, startTime, endTime)}
              </span>
              <span className="counter">
                {filterPageInCount(data, e, startTime, endTime)}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
