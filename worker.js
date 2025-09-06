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

  await new Promise((r) => setTimeout(r, 0)); // yield back to event loop
}

async function solver(settings, max, target, signal) {
  // settings = 0 => add
  // settings = 1 => multiply
  // settings = 2 => exponents

  const cache = {};

  const result = await calculate(target);
  self.postMessage({ type: "DONE", result });

  async function calculate(target, maxDepth) {
    // extraction
    if (target <= max && target % 10 !== 0) {
      return { number: target, source: "extractor" };
    }
    // cache
    if (cache[target]) return cache[target];

    // early game - only addition
    if (settings === 0) {
      return {
        number: target,
        source: "add",
        a: await calculate(max),
        b: await calculate(target - max),
      };
    }
  }
}
