const API_URL = "/api/tasks";
const state = { tasks: [], view: "board", editingId: null, category: "", search: "", sort: "created" };
const $ = (id) => document.getElementById(id);
const statusInfo = {
  Pending: { label: "To do", list: "pendingList", count: "pendingCount" },
  InProgress: { label: "In progress", list: "progressList", count: "progressCount" },
  Completed: { label: "Done", list: "completedList", count: "completedCount" }
};

document.addEventListener("DOMContentLoaded", () => {
  $("todayLabel").textContent = new Intl.DateTimeFormat("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  loadTasks();
  $("addTaskTop").addEventListener("click", () => openModal());
  $("closeModal").addEventListener("click", closeModal);
  $("cancelModal").addEventListener("click", closeModal);
  $("modalBackdrop").addEventListener("click", e => { if (e.target === $("modalBackdrop")) closeModal(); });
  $("taskForm").addEventListener("submit", saveTask);
  $("searchInput").addEventListener("input", e => { state.search = e.target.value.trim().toLowerCase(); render(); });
  $("categoryFilter").addEventListener("change", e => { state.category = e.target.value; render(); });
  $("sortSelect").addEventListener("change", e => { state.sort = e.target.value; render(); });
  document.querySelectorAll(".view-tab").forEach(button => button.addEventListener("click", () => {
    state.view = button.dataset.view;
    document.querySelectorAll(".view-tab").forEach(tab => tab.classList.toggle("active", tab === button));
    render();
  }));
  document.querySelectorAll(".column-add").forEach(button => button.addEventListener("click", () => openModal(null, button.dataset.addStatus)));
  document.querySelectorAll(".label-filter").forEach(button => button.addEventListener("click", () => {
    state.category = state.category === button.dataset.category ? "" : button.dataset.category;
    $("categoryFilter").value = state.category;
    render();
  }));
  $("menuButton").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("searchInput").focus(); }
    if (e.key === "Escape") closeModal();
  });
});

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.title || body.message || message; } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function loadTasks() {
  $("loadingState").hidden = false;
  $("errorState").hidden = true;
  try {
    state.tasks = await apiRequest(API_URL);
    render();
  } catch (error) {
    $("errorState").textContent = `Couldn't load tasks. ${error.message}. Make sure the .NET API is running, then refresh this page.`;
    $("errorState").hidden = false;
  } finally {
    $("loadingState").hidden = true;
  }
}

function filteredTasks() {
  let tasks = [...state.tasks];
  if (state.category) tasks = tasks.filter(task => (task.category || "General") === state.category);
  if (state.search) tasks = tasks.filter(task => `${task.title} ${task.description || ""} ${task.category || ""}`.toLowerCase().includes(state.search));
  if (state.sort === "title") tasks.sort((a,b) => a.title.localeCompare(b.title));
  if (state.sort === "due") tasks.sort((a,b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  if (state.sort === "priority") {
    const rank = { High: 0, Medium: 1, Low: 2 };
    tasks.sort((a,b) => rank[a.priority] - rank[b.priority]);
  }
  if (state.sort === "created") tasks.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  return tasks;
}

function render() {
  const tasks = filteredTasks();
  const count = status => tasks.filter(task => task.status === status).length;
  $("totalStat").textContent = state.tasks.length;
  $("pendingStat").textContent = state.tasks.filter(t => t.status === "Pending").length;
  $("progressStat").textContent = state.tasks.filter(t => t.status === "InProgress").length;
  $("completedStat").textContent = state.tasks.filter(t => t.status === "Completed").length;
  $("sideTaskCount").textContent = state.tasks.length;
  Object.entries(statusInfo).forEach(([status, info]) => {
    $(info.count).textContent = count(status);
    const columnTasks = tasks.filter(task => task.status === status);
    $(info.list).innerHTML = columnTasks.length ? columnTasks.map(taskCard).join("") : `<div class="empty-column">${state.search || state.category ? "No matching tasks here" : "Nothing here yet — add a task to get started."}</div>`;
  });
  $("boardView").hidden = state.view !== "board";
  $("tableView").hidden = state.view !== "table";
  $("calendarView").hidden = state.view !== "calendar";
  if (state.view === "table") renderTable(tasks);
  if (state.view === "calendar") renderCalendar(tasks);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
}
function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(`${value.slice(0,10)}T00:00:00`);
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}
function isOverdue(value, status) {
  return value && status !== "Completed" && new Date(`${value.slice(0,10)}T23:59:59`) < new Date();
}
function taskCard(task) {
  const category = (task.category || "General").toLowerCase();
  const priority = (task.priority || "Medium").toLowerCase();
  return `<article class="task-card">
    <div class="card-top"><span class="category-tag ${escapeHtml(category)}">${escapeHtml(task.category || "General")}</span>
      <button class="card-menu" data-edit="${task.id}" aria-label="Edit ${escapeHtml(task.title)}">•••</button></div>
    <h3>${escapeHtml(task.title)}</h3>
    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
    <div class="card-meta"><span class="priority-pill priority-${priority}">${escapeHtml(task.priority || "Medium")}</span>
      <span class="date-pill ${isOverdue(task.dueDate,task.status) ? "overdue" : ""}">◷ ${formatDate(task.dueDate)}</span></div>
    <div class="card-bottom"><span class="card-id">TASK-${String(task.id).padStart(3,"0")}</span><div class="card-actions">
      <button class="mini-action" data-edit="${task.id}">Edit</button>
      <button class="mini-action" data-delete="${task.id}">Delete</button>
      ${task.status !== "Completed" ? `<button class="mini-action" data-complete="${task.id}" title="Mark complete">✓</button>` : ""}
    </div></div></article>`;
}

function renderTable(tasks) {
  $("tableView").innerHTML = tasks.length ? `<table class="task-table"><thead><tr><th>TASK</th><th>CATEGORY</th><th>PRIORITY</th><th>STATUS</th><th>DUE DATE</th><th>ACTIONS</th></tr></thead><tbody>${tasks.map(task => `<tr>
    <td><span class="table-title">${escapeHtml(task.title)}</span><br><span style="color:#a0a2b0">${escapeHtml(task.description || "No description")}</span></td>
    <td>${escapeHtml(task.category || "General")}</td><td>${escapeHtml(task.priority || "Medium")}</td>
    <td><span class="status-pill status-${task.status.toLowerCase()}">${statusInfo[task.status]?.label || task.status}</span></td>
    <td>${formatDate(task.dueDate)}</td><td class="table-actions"><button class="mini-action" data-edit="${task.id}">Edit</button><button class="mini-action" data-delete="${task.id}">Delete</button></td>
    </tr>`).join("")}</tbody></table>` : `<div class="empty-column">No tasks match your filters.</div>`;
}

function renderCalendar(tasks) {
  const today = new Date();
  const year = today.getFullYear(), month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push(`<div class="calendar-day"></div>`);
  for (let day=1;day<=days;day++) {
    const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const matching = tasks.filter(task => task.dueDate && task.dueDate.slice(0,10) === dateKey);
    cells.push(`<div class="calendar-day"><strong>${day}</strong>${matching.map(task => `<span class="calendar-task ${task.status.toLowerCase()}" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</span>`).join("")}</div>`);
  }
  $("calendarView").innerHTML = `<div class="calendar-header"><h2>${today.toLocaleDateString("en-ZA",{month:"long",year:"numeric"})}</h2><span style="font-size:11px;color:#999">Tasks with due dates appear on the calendar</span></div><div class="calendar-grid">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=>`<div class="calendar-day" style="min-height:auto;background:#fafaff;font-weight:700">${day}</div>`).join("")}${cells.join("")}</div>`;
}

function openModal(task = null, presetStatus = "Pending") {
  state.editingId = task ? task.id : null;
  $("taskForm").reset();
  $("modalTitle").textContent = task ? "Edit task" : "Create a task";
  $("saveTaskButton").innerHTML = task ? "Save changes <span>→</span>" : "Create task <span>→</span>";
  $("taskTitle").value = task?.title || "";
  $("taskDescription").value = task?.description || "";
  $("taskCategory").value = task?.category || "General";
  $("taskPriority").value = task?.priority || "Medium";
  $("taskStatus").value = task?.status || presetStatus;
  $("taskDueDate").value = task?.dueDate ? task.dueDate.slice(0,10) : "";
  $("formError").textContent = "";
  $("modalBackdrop").hidden = false;
  setTimeout(() => $("taskTitle").focus(), 50);
}
function closeModal() { $("modalBackdrop").hidden = true; state.editingId = null; }

async function saveTask(event) {
  event.preventDefault();
  const payload = {
    title: $("taskTitle").value.trim(),
    description: $("taskDescription").value.trim() || null,
    category: $("taskCategory").value,
    priority: $("taskPriority").value,
    status: $("taskStatus").value,
    dueDate: $("taskDueDate").value ? `${$("taskDueDate").value}T00:00:00` : null
  };
  if (payload.title.length < 2) { $("formError").textContent = "Please enter a task name with at least 2 characters."; return; }
  const button = $("saveTaskButton");
  button.disabled = true;
  try {
    if (state.editingId) {
      await apiRequest(`${API_URL}/${state.editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Task updated successfully");
    } else {
      await apiRequest(API_URL, { method: "POST", body: JSON.stringify(payload) });
      showToast("Task created successfully");
    }
    closeModal();
    await loadTasks();
  } catch (error) {
    $("formError").textContent = error.message;
  } finally { button.disabled = false; }
}

document.addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  const completeButton = event.target.closest("[data-complete]");
  if (editButton) {
    const task = state.tasks.find(item => item.id === Number(editButton.dataset.edit));
    if (task) openModal(task);
  }
  if (deleteButton) {
    const id = Number(deleteButton.dataset.delete);
    const task = state.tasks.find(item => item.id === id);
    if (task && confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      try {
        await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
        showToast("Task deleted");
        await loadTasks();
      } catch (error) { showToast(error.message); }
    }
  }
  if (completeButton) {
    const id = Number(completeButton.dataset.complete);
    const task = state.tasks.find(item => item.id === id);
    if (task) {
      try {
        await apiRequest(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify({ ...task, status: "Completed" }) });
        showToast("Task marked as done");
        await loadTasks();
      } catch (error) { showToast(error.message); }
    }
  }
});

let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
