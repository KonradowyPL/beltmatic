let abortController = null;

self.onmessage = (event) => {
	const { type, args } = event.data;

	if (type === "RUN") run(args);
	else if (type === "STOP") stop();
};

function run(args) {
	console.log("Worker: computation started with args:", args);

	stop(); // cancel previous if running
	abortController = new AbortController();
	const { signal } = abortController;

	solver(args.settings, args.max, args.target, signal);
}

function stop() {
	if (abortController) {
		abortController.abort();
		abortController = null;
	}
}

async function loopYield(signal) {
	if (signal.aborted) {
		self.postMessage({ type: "STOPPED" });
		throw new Error("Aborted"); // exit computation cleanly
	}

	if (Math.random() < 0.01) {
		// yield back to event loop
		await new Promise((r) => setTimeout(r, 0));
		console.log("Ping!", Math.random());
	}
}

async function solver(settings, max, target, signal) {
	const cache = {};

	const result = await calculate(
		settings,
		max,
		target,
		Number.POSITIVE_INFINITY
	);
	console.log("Finished", result);
	self.postMessage({ type: "DONE", result });

	async function calculate(settings, max, target, maxDepth) {
		// cache
		if (cache[target]) return cache[target];

		// you can extract this number
		if (target <= max && target % 10 !== 0) {
			cache[target] = [{ number: target, source: "extractor" }, 0];
			return cache[target];
		}

		if (maxDepth <= 0) {
			return [null, Number.POSITIVE_INFINITY];
		}

		// vars for min solution
		let min = Number.POSITIVE_INFINITY;
		let min_solution = null;

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

				const a = await calculate(settings, max, base, min - 1); // calculate for base
				const b = await calculate(
					settings,
					max,
					exponent,
					min - 1 - a[1]
				); // calculate for expoenent

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
					const a = await calculate(
						settings,
						max,
						solution[0],
						min - 1
					);
					const b = await calculate(
						settings,
						max,
						solution[1],
						min - 1 - a[1]
					);
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
			}
		}

		if (settings.add && min > 2) {
			// loop for each number to max extracted

			//     for (let num = 1; num <= max; num++) {
			// for (let num = Math.ceil(target/2); num >= max; num--) {
			for (let num = Math.ceil(target / 2); num >= max; num--) {
				const a = await calculate(settings, max, target - num, min - 1); // calculate for remaining number
				if (a[1] >= min) continue;
				const b = await calculate(settings, max, num, min - 1 - a[1]); // calculate for number
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

		await loopYield(signal);

		return cache[target];
	}
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
function findPrimeFactors(_num) {
	let num = _num;
	const primeFactors = [];
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
