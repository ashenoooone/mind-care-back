export const getDay = (date: Date) => {
  const dayIndex = date.getDay();
  return dayIndex === 0 ? 6 : dayIndex - 1;
};
