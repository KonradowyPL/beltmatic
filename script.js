import { solve, purgeCache, getCache } from "./solve.js";



const progress = document.getElementById("progress");
const json = document.getElementById("json");
document.getElementById("mainform").onsubmit = async (e) => {
  e.preventDefault();
  const settings = {
    add: document.getElementById("add").checked,
    multiply: document.getElementById("multiply").checked,
    exponents: document.getElementById("exponentiation").checked,
  };
  const max = +document.getElementById("max").value;
  const target = +document.getElementById("target").value;

  if (!(max && target)) return;
  progress.textContent = "Caluclating...";
  document.getElementById("result").innerHTML = ""
  document.getElementById("json").innerHTML = ""
  document.getElementById("formula").innerHTML =""
  await new Promise((resolve) => setTimeout(resolve, 0));

  try {
  const answer = solve(settings, max, target);
  progress.textContent = `Succes! Found solution using ${answer[1]} steps!`;
  json.textContent = JSON.stringify(answer)
  document.getElementById("formula").innerHTML ="Math formula: " +  displayFormula(answer[0]);
  display(answer[0], document.getElementById("result"));
  } catch (e) {
    progress.textContent = `Error: ${e.message}`;
    throw e
  }
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
  div.className = "table";

  const header = document.createElement("div");
  header.className = "header";

  const nums = document.createElement("div");
  nums.className = "data";

  header.innerHTML = `Extract ${data.number}`;
  div.append(header);

  const map = {
    add: "%a+%b",
    multiply: "%a*%b",
    exponentiate: "%a<sup>%b</sup>",
  };

  if (data.source != "extractor") {
    header.innerHTML = `${data.number} = ${map[data.source]
      .replace("%a", data.a.number)
      .replace("%b", data.b.number)}`;

    const a = document.createElement("div");
    const b = document.createElement("div");
    nums.append(a, b);
    div.append(nums);
    display(data.a, a);
    display(data.b, b);
  }
};
