import { solve, purgeCache } from "./solve.js";
const progress = document.getElementById("progress");
document.getElementById("mainform").onsubmit = async (e) => {
  e.preventDefault();
  const settings = {
    add: document.getElementById("add").checked,
    multiply: document.getElementById("multiply").checked,
    exponents: document.getElementById("add").checked,
  };
  const max = +document.getElementById("max").value;
  const target = +document.getElementById("target").value;

  if (!(max && target)) return;
  progress.textContent = "Caluclating...";
  await new Promise((resolve) => setTimeout(resolve, 0));

  // try {
  const answer = solve(settings, max, target);
  progress.textContent = `Succes: ${JSON.stringify(answer)}`;
  document.getElementById("formula").innerHTML = displayFormula(answer[0]);
  display(answer[0], document.getElementById("result"));
  // } catch (e) {
  //   progress.textContent = `Error: ${e.message}`;
  // }
};

const displayFormula = (data) => {
  const type = data.source;
  if (type == "extractor") return `${data.number}`;
  const map = {
    add: "(%a+%b)",
    multiply: "(%a*%b)",
    exponentiate: "(%a<sup>%b</sup>)",
  };
  return map[data.source]
    .replace("%a", displayFormula(data.a))
    .replace("%b", displayFormula(data.b));
};

const display = (data, div) => {
  const header = document.createElement("div");
  header.className = "header";

  const nums = document.createElement("div");
  nums.className = "data";

  header.innerHTML = data.number;
  div.append(header);

  if (data.source != "extractor") {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const mode = document.createElement("div");
    mode.textContent = { add: "+", multiply: "*", exponentiate: "^" }[
      data.source
    ];
    nums.append(a, mode, b);
    div.append(nums);
    display(data.a, a);
    display(data.b, b);
  }
};
