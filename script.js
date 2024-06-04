import { solve, purgeCache } from "./solve.js";
const progress = document.getElementById("progress");
document.getElementById("mainform").onsubmit = async (e) => {
  e.preventDefault();
  const settings = {
    add: document.getElementById("add").checked,
    multiply: document.getElementById("multiply").checked,
    exponents: document.getElementById("add").checked,
  };
  const max = document.getElementById("max").value;
  const target = document.getElementById("target").value;

  if (!(max && target)) return;
  progress.textContent = "Caluclating...";
  await new Promise((resolve) => setTimeout(resolve, 0));

  try {
    const answer = solve(settings, max, target);
    progress.textContent = `Succes: ${JSON.stringify(answer)}`;
  } catch (e) {
    progress.textContent = `Error: ${e.message}`;
  }
};
