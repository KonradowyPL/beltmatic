const settings = {
  add: true,
  multiply: true,
  exponents: true,
};

const max = 2;
const target = 2 ** 17;

import { solve, purgeCache } from "./solve.js";

console.log(solve(settings, max, target));
