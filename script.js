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

  // try {
  const answer = solve(settings, max, target);
  progress.textContent = `Succes: ${JSON.stringify(answer)}`;
  document.getElementById("result").innerHTML = display(answer[0]);
  // } catch (e) {
  //   progress.textContent = `Error: ${e.message}`;
  // }
};

const display = (data) => {
  const type = data.source;
  if (type == "extractor") return `${data.number}`;
  const map = {
    add: "(%a+%b)",
    multiply: "(%a*%b)",
    exponentiate: "(%a<sup>%b</sup>)",
  };
  return map[data.source]
    .replace("%a", display(data.a))
    .replace("%b", display(data.b));
};
