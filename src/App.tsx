import { useState } from "react";
import "./App.css";
import {
  Autocomplete,
  Backdrop,
  Button,
  CircularProgress,
  Fab,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  filterPageInPercent,
  filterPageInCount,
  countUsersInPeriod,
} from "./feachers";
import { leavingPages, leavingPagesFuel, newLeavingPages } from "./constant";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/uk";
import { useDayParts } from "./hooks/useDates";
import ModalAddLanding from "./components/ModalAddLanding";
import AddIcon from "@mui/icons-material/Add";
import { useGetLandingList } from "./hooks/useLandingList";
import { useGetStatistic } from "./hooks/useGetStatistic";

const reactID = ["88333", "88275", "89060"];
const ADMIN = import.meta.env.VITE_PASSWORD;
const storagePassword = localStorage.getItem("admin")
  ? localStorage.getItem("admin")
  : "";

function App() {
  const [id, setId] = useState("");
  const {data, totalUsers, isLoading, getStatistic} = useGetStatistic();
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const { dayParts, setCurrentDate } = useDayParts(date);
  const [autocompleteValue, setAutocompleteValue] = useState<null | string>(
    null
  );
  const [open, setOpen] = useState<boolean>(false);
  const { data: current } = useGetLandingList();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const minTimestamp = date?.startOf("day").toDate().getTime();

  const maxTimestamp = date?.endOf("day").toDate().getTime();

  function getData() {
    getStatistic(id, minTimestamp, maxTimestamp);
  }

  function setPeriod(period: string) {
    setStartTime(+period.split(" ")[0]);
    setEndTime(+period.split(" ")[1]);
  }

  function changeDate(newDate: dayjs.Dayjs | null) {
    setPeriod("0 0");
    setDate(newDate);
    setCurrentDate(newDate);
  }

  return (
    <div className="container">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <ModalAddLanding open={open} handleClose={handleClose} landingsList={current} />
      <div className="selects">
        <Autocomplete
          className="item"
          value={autocompleteValue}
          options={current.map((e) => e.landingName)}
          onChange={(_event: any, newValue: string | null) => {
            setAutocompleteValue(newValue);
            setId(
              newValue
                ? current.filter((e) => e.landingName === newValue)[0].landingId.toString()
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
            onChange={(newDate) => changeDate(newDate)}
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
          {(reactID.some((e) => e === id)
            ? newLeavingPages
            : id === "88238"
            ? leavingPagesFuel
            : leavingPages
          ).map((e, i) => (
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
      {ADMIN === storagePassword && (
        <div className="addBtn">
          <Fab color="secondary" aria-label="add" onClick={handleOpen}>
            <AddIcon />
          </Fab>
        </div>
      )}
    </div>
  );
}

export default App;
