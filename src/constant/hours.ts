const partss = [];

let startTime = "";
let endTime = "";

for (let i = 0; i < 24; i++) {
  if (i <= 9) {
    startTime = `0${i}:00`;
    endTime = `0${i + 1}:00`;
  } else if (i === 9) {
    startTime = `0${i}:00`;
    endTime = `${i + 1}:00`;
  } else {
    startTime = `${i}:00`;
    endTime = `${i + 1}:00`;
  }

  partss.push({
    startTime,
    endTime,
  });
}

export const parts = partss