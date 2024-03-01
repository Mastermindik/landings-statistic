import { LandingStatisticType } from "../types";

export function filterPageInPercent(
  data: LandingStatisticType[],
  name: string,
  startTime: number,
  endTime: number
): string {
  if (!data.length) {
    return "0";
  } else {
    return (
      (
        (data
          ?.filter((e: any) =>
            startTime === 0
              ? true
              : e.myTimestamp > startTime && e.myTimestamp < endTime
          )
          .filter((e: any) => e.leavingPage === name).length /
          (startTime === 0
            ? data
            : data?.filter(
                (e: any) => e.myTimestamp > startTime && e.myTimestamp < endTime
              )
          )?.length) *
        100
      ).toFixed(2) + "%"
    );
  }
}

export function filterPageInCount(
  data: LandingStatisticType[],
  name: string,
  startTime: number,
  endTime: number
): number {
  if (!data.length) {
    return 0;
  }
  return data
    ?.filter((e: any) =>
      startTime === 0
        ? true
        : e.myTimestamp > startTime && e.myTimestamp < endTime
    )
    .filter((e: any) => e.leavingPage === name).length;
}

export function countUsersInPeriod(
  data: LandingStatisticType[],
  startTime: number,
  endTime: number
): number {
  if (!data.length) {
    return 0
  }
  return (
    startTime === 0
      ? data
      : data?.filter(
          (e: any) => e.myTimestamp > startTime && e.myTimestamp < endTime
        )
  )?.length;
}
