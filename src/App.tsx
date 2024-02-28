import { useState } from "react";
import "./App.css";
import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";

function App() {
  const [count, setCount] = useState(0);
  const [id, setId] = useState("");
  const [data, setData] = useState<any>();
  const [length, setLength] = useState(0)

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
      
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="container">
      <div className="">
      <input
        type="text"
        placeholder="ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={getItems}>Search</button>
      </div>
      <div className="stage">
        <b>Стартова сторінка:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Стартова сторінка").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Питання 2:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Питання 2").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Питання 3:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Питання 3").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Перевірка результатів + 1 модальне вікно:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Перевірка результатів + 1 модальне вікно").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Коробки:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Коробки").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Коробки після невдалої спроби відкриття:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Коробки після невдалої спроби відкриття").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Коробки після невдалої спроби відкриття 2:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Коробки після невдалої спроби відкриття 2").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Модальне вікно після 1 невдалого відкриття:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Модальне вікно після 1 невдалого відкриття").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Модальне вікно після 2 невдалого відкриття:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Модальне вікно після 2 невдалого відкриття").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Модальне вікно після успішного відкриття:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Модальне вікно після успішного відкриття").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Корзина:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Корзина").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
      <div className="stage">
        <b>Форма відправлена:</b>
        <span>{(data?.filter((e:any) => e.leavingPage.S === "Форма відправлена").length / data?.length * 100).toFixed(2) + "%"}</span>
      </div>
    </div>
  );
}

export default App;
