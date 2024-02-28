import { useState } from "react";
import "./App.css";
import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const timeZone = "Europe/Kiev"; // Ваш часовий пояс

const currentDate = new Date();
const hoursInDay = 24;
const hourMilliseconds = 60 * 60 * 1000; // 1 година у мілісекундах

type Formated = {
  start: number;
  end: number;
};

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

const current = [
  {
    id: 86166,
    name: "HU - Pampers Danya DM",
  },
  {
    id: 86042,
    name: "FR - Royal Canin Danya ID123",
  },
  {
    id: 85018,
    name: "MX - Dell Danya Mercado libre",
  },
  {
    id: 84609,
    name: "FR - Kit Prefill Склад",
  },
  {
    id: 84337,
    name: "IT - Kit Prefill Склад ID123",
  },
];

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
      FilterExpression: "landingId = :landingId",
      ExpressionAttributeValues: {
        ":landingId": {
          N: id,
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

  function setPeriod(start: number, end: number) {
    setStartTime(start);
    setEndTime(end);
  }

  return (
    <div className="container">
      <div className="">
        {/* <input
        type="text"
        placeholder="ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      /> */}
        <select
          name=""
          id=""
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          <option value="0">--none--</option>
          {current.map((e) => (
            <option value={e.id} key={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button onClick={getItems}>Search</button>
      </div>
      {!!data.length && (
        <>
          <div className="buttons">
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
          </div>
          <b>
            Кількість користувачів:{" "}
            {
              (startTime === 0
                ? data
                : data?.filter(
                    (e: any) =>
                      e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Стартова сторінка")
                  .length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Питання 2").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Питання 3").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Коробки").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Корзина").length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
                  )
                  .filter((e: any) => e.leavingPage.S === "Форма відправлена")
                  .length /
                  (startTime === 0
                    ? data
                    : data?.filter(
                        (e: any) =>
                          e.timestamp.N > startTime && e.timestamp.N < endTime
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
                      : e.timestamp.N > startTime && e.timestamp.N < endTime
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
