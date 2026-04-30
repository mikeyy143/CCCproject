const API_BASE = "http://localhost:3000";

const taskTableBody = document.getElementById("taskTableBody");
const addTaskBtn = document.getElementById("addTaskBtn");
const solveBtn = document.getElementById("solveBtn");
const loadExampleBtn = document.getElementById("loadExampleBtn");
const maxProfitEl = document.getElementById("maxProfit");
const selectedTasksEl = document.getElementById("selectedTasks");
const timelineEl = document.getElementById("timeline");
const dpTableEl = document.getElementById("dpTable");
const decisionTextEl = document.getElementById("decisionText");

function createTaskRow(task = { start: "", end: "", profit: "" }) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="task-id"></td>
    <td><input type="number" min="0" value="${task.start}" /></td>
    <td><input type="number" min="1" value="${task.end}" /></td>
    <td><input type="number" min="0" value="${task.profit}" /></td>
    <td><button class="remove-btn">Remove</button></td>
  `;

  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    refreshTaskNumbers();
  });

  taskTableBody.appendChild(row);
  refreshTaskNumbers();
}

function refreshTaskNumbers() {
  [...taskTableBody.querySelectorAll("tr")].forEach((row, index) => {
    row.querySelector(".task-id").textContent = String(index + 1);
  });
}

function getTasksFromInput() {
  const rows = [...taskTableBody.querySelectorAll("tr")];
  return rows.map((row, index) => {
    const [startInput, endInput, profitInput] = row.querySelectorAll("input");
    return {
      id: index + 1,
      start: Number(startInput.value),
      end: Number(endInput.value),
      profit: Number(profitInput.value),
    };
  });
}

function renderSelectedTasks(tasks) {
  selectedTasksEl.innerHTML = "";
  if (!tasks.length) {
    selectedTasksEl.innerHTML = "<li>No tasks selected.</li>";
    return;
  }
  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = `Task ${task.id}: [${task.start}, ${task.end}] profit ${task.profit}`;
    selectedTasksEl.appendChild(li);
  });
}

function renderTimeline(allTasks, selectedTasks) {
  timelineEl.innerHTML = "";
  if (!allTasks.length) return;

  const maxEnd = Math.max(...allTasks.map((task) => task.end));
  const selectedIds = new Set(selectedTasks.map((task) => task.id));

  allTasks
    .slice()
    .sort((a, b) => a.start - b.start)
    .forEach((task) => {
      const row = document.createElement("div");
      row.className = "timeline-row";

      const label = document.createElement("div");
      label.textContent = `Task ${task.id} (${task.profit})`;

      const track = document.createElement("div");
      track.className = "timeline-track";

      const bar = document.createElement("div");
      bar.className = `timeline-bar ${selectedIds.has(task.id) ? "selected" : ""}`;
      bar.style.left = `${(task.start / maxEnd) * 100}%`;
      bar.style.width = `${((task.end - task.start) / maxEnd) * 100}%`;
      bar.textContent = `${task.start}-${task.end}`;

      track.appendChild(bar);
      row.appendChild(label);
      row.appendChild(track);
      timelineEl.appendChild(row);
    });
}

function initializeDpTable(tableLength) {
  dpTableEl.innerHTML = "";
  for (let i = 0; i < tableLength; i += 1) {
    const cell = document.createElement("div");
    cell.className = "dp-cell";
    cell.id = `dp-cell-${i}`;
    cell.textContent = `dp[${i}] = 0`;
    dpTableEl.appendChild(cell);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateDpStates(dpStates, finalDpTable) {
  initializeDpTable(finalDpTable.length);
  decisionTextEl.textContent = "Starting DP table animation...";

  for (const state of dpStates) {
    const cell = document.getElementById(`dp-cell-${state.step}`);
    if (!cell) continue;

    cell.classList.add("active");
    cell.textContent = `dp[${state.step}] = ${state.dp_snapshot[state.step]}`;

    decisionTextEl.textContent =
      `Step ${state.step}: Task ${state.task.id} | include=${state.include_profit}, ` +
      `exclude=${state.exclude_profit} -> ${state.decision.toUpperCase()}`;

    await sleep(700);
    cell.classList.remove("active");
  }

  decisionTextEl.textContent = "DP animation complete.";
}

async function solveTasks() {
  const tasks = getTasksFromInput();
  if (!tasks.length) {
    decisionTextEl.innerHTML = `<span class="error">Add at least one task first.</span>`;
    return;
  }

  solveBtn.disabled = true;
  decisionTextEl.textContent = "Solving with Python DP engine...";

  try {
    const response = await fetch(`${API_BASE}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to solve.");
    }

    const dpSolution = data.result.dp_solution;
    maxProfitEl.textContent = String(dpSolution.max_profit);
    renderSelectedTasks(dpSolution.selected_tasks);
    renderTimeline(data.result.input_tasks, dpSolution.selected_tasks);
    await animateDpStates(dpSolution.dp_states, dpSolution.dp_table);
  } catch (error) {
    decisionTextEl.innerHTML = `<span class="error">${error.message}</span>`;
  } finally {
    solveBtn.disabled = false;
  }
}

function loadExampleTasks() {
  taskTableBody.innerHTML = "";
  const sample = [
    { start: 1, end: 3, profit: 50 },
    { start: 2, end: 5, profit: 20 },
    { start: 4, end: 6, profit: 70 },
    { start: 6, end: 7, profit: 60 },
    { start: 5, end: 8, profit: 30 },
    { start: 7, end: 9, profit: 40 },
  ];
  sample.forEach((task) => createTaskRow(task));
}

addTaskBtn.addEventListener("click", () => createTaskRow());
solveBtn.addEventListener("click", solveTasks);
loadExampleBtn.addEventListener("click", loadExampleTasks);

loadExampleTasks();
