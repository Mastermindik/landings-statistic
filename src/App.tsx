import { useState } from "react";
import "./App.css";
import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { current } from "./constatns";

const timeZone = "Europe/Kiev"; // Ваш часовий пояс

const currentDate = new Date();
const hoursInDay = 24;
const hourMilliseconds = 60 * 60 * 1000; // 1 година у мілісекундах

type Formated = {
  start: number;
  end: number;
};
const startOfDay = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate(),
  0,
  0,
  0
);

// Приводимо до часового поясу
startOfDay.toLocaleString("en-US", { timeZone });

const startOfDayTimestamp = startOfDay.getTime();
console.log(startOfDayTimestamp);

const hourlyRanges: Formated[] = [];

for (let i = 0; i < hoursInDay; i++) {
  const startHour = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    i,
    0,
    0
  );
  const endHour = new Date(startHour.getTime() + hourMilliseconds);

  // Приводимо до часового поясу
  startHour.toLocaleString("en-US", { timeZone });
  endHour.toLocaleString("en-US", { timeZone });

  hourlyRanges.push({
    start: startHour.getTime(),
    end: endHour.getTime(),
  });
}

const hoursFormatted = hourlyRanges.map((range) => ({
  start: range.start,
  end: range.end,
  startNew: new Date(range.start).toLocaleTimeString("ua-UA", {
    hour: "numeric",
    minute: "numeric",
    timeZone,
  }),
  endNew: new Date(range.end).toLocaleTimeString("ua-UA", {
    hour: "numeric",
    minute: "numeric",
    timeZone,
  }),
}));



function App() {
  // const [count, setCount] = useState(0);
  const [id, setId] = useState("");
  const [data, setData] = useState<any>([]);
  // const [length, setLength] = useState(0)
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  const ddbClient = new DynamoDBClient({
    region: import.meta.env.VITE_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_ACCESSKEYID,
      secretAccessKey: import.meta.env.VITE_SECRETACCESSKEY,
    },
  });

  async function getItems() {

    const params: ScanCommandInput = {
      TableName: "LandingsUserStatistic",
      FilterExpression: "landingId = :landingId AND myTimestamp > :timestamp ",
      ExpressionAttributeValues: {
        ":landingId": {
          N: `${+id}`,
        },
        ":timestamp": {
          N: "1000",
        },
      },
    };

    try {
      const data = await ddbClient.send(new ScanCommand(params));
      setData(data.Items);
      console.log(data.Count);
      const arr = data.Items?.map((e) => unmarshall(e));
      console.log(arr);
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
        
        <FormControl className="item" variant="filled" >
          <InputLabel id="demo-simple-select-label" >Name</InputLabel>
          <Select
            label="Name"
            value={id}
            onChange={(e) => setId(e.target.value)}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
          >
            {current.map((e) => (
              <MenuItem value={e.id} key={e.id}>
                {e.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className="item" variant="filled" >
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
        <Button className="item" size="large" variant="contained" disabled={!id} onClick={getItems}>
          Search
        </Button>
      </div>
      {!!data.length && (
        <>
          {/* <div className="buttons">
            {hoursFormatted.map((e) => (
              <button
                className=""
                key={e.start}
                style={{
                  background: startTime === e.start ? "red" : "#1a1a1a",
                }}
                onClick={() => setPeriod(e.start, e.end)}
              >
                {e.startNew} - {e.endNew}
              </button>
            ))}
            <button
              className=""
              style={{ background: startTime === 0 ? "red" : "#1a1a1a" }}
              onClick={() => setPeriod(0, 0)}
            >
              Full Day
            </button>
          </div> */}
          <b>
            Кількість користувачів:{" "}
            {
              (startTime === 0
                ? data
                : data?.filter(
                    (e: any) =>
                      e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
              )?.length
            }
          </b>
          <div className="stage">
            <b>Стартова сторінка:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Стартова сторінка")
                  .length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Стартова сторінка")
                  .length
              }
            </span>
          </div>
          <div className="stage">
            <b>Питання 2:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Питання 2").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Питання 2").length
              }
            </span>
          </div>
          <div className="stage">
            <b>Питання 3:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Питання 3").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Питання 3").length
              }
            </span>
          </div>
          <div className="stage">
            <b>Перевірка результатів + 1 модальне вікно:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Перевірка результатів + 1 модальне вікно"
                  ).length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Перевірка результатів + 1 модальне вікно"
                  ).length
              }
            </span>
          </div>
          <div className="stage">
            <b>Коробки:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Коробки").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Коробки").length
              }
            </span>
          </div>
          <div className="stage">
            <b>Коробки після невдалої спроби відкриття:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Коробки після невдалої спроби відкриття"
                  ).length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Коробки після невдалої спроби відкриття"
                  ).length
              }
            </span>
          </div>
          <div className="stage">
            <b>Коробки після невдалої спроби відкриття 2:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Коробки після невдалої спроби відкриття 2"
                  ).length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Коробки після невдалої спроби відкриття 2"
                  ).length
              }
            </span>
          </div>
          <div className="stage">
            <b>Модальне вікно після 1 невдалого відкриття:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Модальне вікно після 1 невдалого відкриття"
                  ).length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Модальне вікно після 1 невдалого відкриття"
                  ).length
              }
            </span>
          </div>
          <div className="stage">
            <b>Модальне вікно після 2 невдалого відкриття:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Модальне вікно після 2 невдалого відкриття"
                  ).length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Модальне вікно після 2 невдалого відкриття"
                  ).length
              }
            </span>
          </div>
          <div className="stage">
            <b>Модальне вікно після успішного відкриття:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Модальне вікно після успішного відкриття"
                  ).length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter(
                    (e: any) =>
                      e.leavingPage.S ===
                      "Модальне вікно після успішного відкриття"
                  ).length
              }
            </span>
          </div>
          <div className="stage">
            <b>Корзина:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Корзина").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Корзина").length
              }
            </span>
          </div>
          <div className="stage">
            <b>Форма відправлена:</b>
            <span>
              {(
                (data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Форма відправлена")
                  .length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                      )
                  )?.length) *
                100
              ).toFixed(2) + "%"}
            </span>
            <span>
              {
                data
                  ?.filter((e: any) =>
                    startTime === 0
                      ? true
                      : e.myTimestamp.N > startTime && e.myTimestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Форма відправлена")
                  .length
              }
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
