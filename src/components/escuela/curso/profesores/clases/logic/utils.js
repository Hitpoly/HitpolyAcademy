export const convertSecondsToUnits = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return { value: "", unit: "segundos" };
  }
  if (totalSeconds % 3600 === 0 && totalSeconds >= 3600) {
    return { value: totalSeconds / 3600, unit: "horas" };
  }
  if (totalSeconds % 60 === 0 && totalSeconds >= 60) {
    return { value: totalSeconds / 60, unit: "minutos" };
  }
  return { value: totalSeconds, unit: "segundos" };
};