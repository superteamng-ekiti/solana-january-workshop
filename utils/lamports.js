export const fromLamport = (value) => {
  let number_value = Number(value);
};

export const toLamport = (value) => {
  let number_value = Number(value);
  return number_value * 10 ** 9;
};

// console.log(toLamport("0.01"));
// 10_000_000;
