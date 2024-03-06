import { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';

interface DayPart {
  start: number;
  end: number;
  startNew: string;
  endNew: string;
}

export const useDayParts = (dayjsObj: Dayjs | null) => {
  const [dayParts, setDayParts] = useState<DayPart[]>([]);
  const [date, setCurrentDate] = useState(dayjsObj)

  useEffect(() => {
    const createDayParts = (date: Dayjs) => {
      const parts: DayPart[] = [];

      for (let i = 0; i < 24; i++) {
        const startTime = date.startOf('day').add(i, 'hour');
        const endTime = date.startOf('day').add(i + 1, 'hour');

        parts.push({
          start: startTime.valueOf(),
          end: endTime.valueOf(),
          startNew: startTime.format('HH:mm'),
          endNew: endTime.format('HH:mm'),
        });
      }

      return parts;
    };

    if (dayjsObj) {
      const generatedDayParts = createDayParts(dayjsObj);
      setDayParts(generatedDayParts);
    } else {
      setDayParts([]);
    }
  }, [date]);

  return {dayParts, setCurrentDate};
};