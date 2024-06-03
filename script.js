"use strict";
const settings = {
  add: true,
  multiply: true,
  exponents: true,
};

const max = 20;
const target = 145;
const primes = sieveOfEratosthenes(target);

const solve = (settings, max, target) => {
  // you can extract this number
  if (target <= max) return [{ number: target, source: "extractor" }, 1];

  const aditionSteps = Math.ceil(max / target);

  // multiplication
  if (settings.multiply) {
    const factors = findPrimeFactors(target);
    const premutations = generateCombinations(factors);
    const cases = premutations.map((arr) => [
      multiplyAll(arr[0]),
      multiplyAll(arr[1]),
    ]);

    // TODO: change this to a larger number
    var min = 9999999999;
    var min_solution = undefined;
    cases.forEach((solution) => {
      const a = solve(settings, max, solution[0]);
      const b = solve(settings, max, solution[1]);
      const steps = a[1] + b[1];
      if (min > steps) {
        min = steps;
        min_solution = {
          a: a[0],
          b: b[0],
          source: "multiply",
        };
      }
    });
    if (min_solution) {
      const obj = {};
      obj[target] = min_solution;
      return [obj, min];
    }
  }

  // we know that amount of steps will be Math.ceil(max/target)
  // addition by subtraction
  if (settings.add) {
    const obj = {};
    const a = solve(settings, max, target - max);
    const b = solve(settings, max, max);
    obj[target] = {
      a: a[0],
      b: b[0],
      source: "add",
    };
    return [obj, a[1] + b[1]];
  }
};

console.log(solve(settings, max, target));

// returns all primes less than number
// TODO: caching
function sieveOfEratosthenes(n) {
  let sieve = [],
    i,
    j,
    primes = [];
  for (i = 2; i <= n; ++i) {
    if (!sieve[i]) {
      primes.push(i);
      for (j = i << 1; j <= n; j += i) {
        sieve[j] = true;
      }
    }
  }
  return primes;
}

function generateCombinations(arr) {
  const results = [];
  const len = arr.length;

  function splitArray(index, arr1, arr2) {
    if (index === len) {
      if (arr1.length > 0 && arr2.length > 0) {
        results.push([arr1, arr2]);
      }
      return;
    }
    splitArray(index + 1, [...arr1, arr[index]], arr2);
    splitArray(index + 1, arr1, [...arr2, arr[index]]);
  }

  splitArray(0, [], []);
  return results;
}

// returns prime factors from number and prime array
function findPrimeFactors(num) {
  let primeFactors = [];
  for (let i = 2; i <= num; i++) {
    while (num % i === 0) {
      primeFactors.push(i);
      num /= i;
    }
  }
  return primeFactors;
}

function multiplyAll(items) {
  let result = 1;
  for (let i = 0; i < items.length; i++) {
    result *= items[i];
  }
  return result;
}
