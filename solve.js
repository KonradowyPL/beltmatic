const cache = {};

const calculate = (settings, max, target) => {
  // cache
  if (cache[target]) return cache[target];

  // you can extract this number
  if (target <= max && target % 10 != 0) {
    cache[target] = [{ number: target, source: "extractor" }, 0];
    return cache[target];
  }

  // vars for min solution
  var min = Infinity;
  var min_solution = undefined;

  const aditionSteps = Math.ceil(target / max);

  // multiplication
  // we have to asume that unlocking exponents
  // means having unlocked multiplying
  if (settings.multiply) {
    const factors = findPrimeFactors(target);

    if (
      settings.exponents && // exponents unlocked
      factors.length > 1 &&
      // all elements in array are the same
      factors.every((val) => val === factors[0])
    ) {
      // target = base ^ exponents
      const base = factors[0];
      const exponent = factors.length;

      const a = calculate(settings, max, base); // calculate for base
      const b = calculate(settings, max, exponent); // calculate for expoenent

      min = a[1] + b[1]; // calculate amount of steps
      min_solution = {
        a: a[0],
        b: b[0],
        source: "exponentiate",
        number: target,
      };
    } else {
      // generate all possible multiplying options
      // where target = a * b
      const premutations = generateCombinations(factors);

      // for loop instead of foreach to save stack space :(
      for (let i = 0; i < premutations.length; i++) {
        const premutation = premutations[i];

        const solution = [
          // try all of premutations
          multiplyAll(premutation[0]),
          multiplyAll(premutation[1]),
        ];
        // calculate for a and b
        const a = calculate(settings, max, solution[0]);
        const b = calculate(settings, max, solution[1]);
        const steps = a[1] + b[1]; // calculate amount of steps
        if (min > steps) {
          min = steps;
          min_solution = {
            a: a[0],
            b: b[0],
            source: "multiply",
            number: target,
          };
        }
      }
      if (!settings.advanced && min_solution && min < aditionSteps) {
        cache[target] = [min_solution, min + 1];
        return cache[target];
      }
    }
  }
  if (settings.add && min > 2) {
    // loop for each number to max extracted

    //     for (let num = 1; num <= max; num++) {
    // for (let num = Math.ceil(target/2); num >= max; num--) {
    for (
      let num = settings.advanced ? Math.ceil(target / 2) : 1;
      settings.advanced ? num >= max : num <= max;
      settings.advanced ? num-- : num++
    ) {
      const a = calculate(settings, max, target - num); // calculate for remaining number
      if (a[1] >= min) continue;
      const b = calculate(settings, max, num); // calculate for number
      const steps = a[1] + b[1];
      if (steps < min) {
        min = steps;
        min_solution = {
          a: a[0],
          b: b[0],
          source: "add",
          number: target,
        };
        if (min <= 2) break;
      }
    }
  }

  // save data to cache
  cache[target] = [min_solution, min + 1];
  return cache[target];
};

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
export { solve, purgeCache, getCache };

const purgeCache = () => {
  for (var prop in cache) {
    if (cache.hasOwnProperty(prop)) {
      delete cache[prop];
    }
  }
};

const getCache = () => {
  return cache;
};

const solve = (settings, max, target) => {
  // purge cache if max number is not the same
  purgeCache();

  const answer = calculate(settings, max, target);
  return answer;
};
