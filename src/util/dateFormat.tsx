export const dateFormat = (date: string) => {
  return date.split("-").reverse().join("/");
};
