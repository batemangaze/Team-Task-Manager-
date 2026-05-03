const API_BASE = "http://127.0.0.1:8000";

const state = {
  token: localStorage.getItem("ttm_token") || "",
  user: null,
  team: JSON.parse(localStorage.getItem("ttm_team") || "null"),
  teams: [],
  members: [],
  tasks: [],
  signupMode: false,
};

const els = {
  apiStatus: document.querySelector("#apiStatus"),
  authView: document.querySelector("#authView"),
  teamChoiceView: document.querySelector("#teamChoiceView"),
  dashboardView: document.querySelector("#dashboardView"),
  authForm: document.querySelector("#authForm"),
  authTitle: document.querySelector("#authTitle"),
  authSubtitle: document.querySelector("#authSubtitle"),
  authSubmit: document.querySelector("#authSubmit"),
  switchAuth: document.querySelector("#switchAuth"),
  authMessage: document.querySelector("#authMessage"),
  authName: document.querySelector("#authName"),
  authPassword: document.querySelector("#authPassword"),
  createTeamForm: document.querySelector("#createTeamForm"),
  joinTeamForm: document.querySelector("#joinTeamForm"),
  teamName: document.querySelector("#teamName"),
  joinTeamId: document.querySelector("#joinTeamId"),
  userInitial: document.querySelector("#userInitial"),
  userName: document.querySelector("#userName"),
  userId: document.querySelector("#userId"),
  teamIdStat: document.querySelector("#teamIdStat"),
  taskCountStat: document.querySelector("#taskCountStat"),
  memberCountStat: document.querySelector("#memberCountStat"),
  teamNameLabel: document.querySelector("#teamNameLabel"),
  teamSelect: document.querySelector("#teamSelect"),
  memberList: document.querySelector("#memberList"),
  logoutBtn: document.querySelector("#logoutBtn"),
  switchTeamBtn: document.querySelector("#switchTeamBtn"),
  leaveTeamBtn: document.querySelector("#leaveTeamBtn"),
  sidebarJoinTeamForm: document.querySelector("#sidebarJoinTeamForm"),
  sidebarJoinTeamId: document.querySelector("#sidebarJoinTeamId"),
  refreshBtn: document.querySelector("#refreshBtn"),
  taskForm: document.querySelector("#taskForm"),
  taskTitle: document.querySelector("#taskTitle"),
  taskDescription: document.querySelector("#taskDescription"),
  assignTo: document.querySelector("#assignTo"),
  taskList: document.querySelector("#taskList"),
  toast: document.querySelector("#toast"),
};

function authHeaders() {
  return {
    Authorization: `Bearer ${state.token}`,
    "Content-Type": "application/json",
  };
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  setTimeout(() => els.toast.classList.add("hidden"), 2600);
}

function setView(view) {
  els.authView.classList.toggle("hidden", view !== "auth");
  els.teamChoiceView.classList.toggle("hidden", view !== "team-choice");
  els.dashboardView.classList.toggle("hidden", view !== "dashboard");
}

function setApiStatus(isOnline) {
  els.apiStatus.classList.toggle("online", isOnline);
  els.apiStatus.classList.toggle("offline", !isOnline);
  els.apiStatus.lastChild.textContent = isOnline ? " API online" : " API offline";
}

async function checkApi() {
  try {
    await fetch(`${API_BASE}/users`);
    setApiStatus(true);
  } catch {
    setApiStatus(false);
  }
}

function renderAuthMode() {
  els.authTitle.textContent = state.signupMode ? "Create user" : "Login";
  els.authSubtitle.textContent = state.signupMode
    ? "Make an account first, then login with it."
    : "Enter your account details to continue.";
  els.authSubmit.textContent = state.signupMode ? "Create User" : "Login";
  els.switchAuth.textContent = state.signupMode ? "Already have an account? Login" : "New user? Create account";
  els.authMessage.textContent = "";
}

async function login(name, password) {
  const form = new URLSearchParams();
  form.append("username", name);
  form.append("password", password);

  const data = await api("/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  state.token = data.access_token;
  localStorage.setItem("ttm_token", state.token);
  await loadMe();
}

async function loadMe() {
  state.user = await api("/me", { headers: authHeaders() });
}

async function loadTeams() {
  state.teams = await api("/teams", { headers: authHeaders() });
}

function chooseFirstAvailableTeam() {
  if (!state.teams.length) {
    state.team = null;
    localStorage.removeItem("ttm_team");
    return false;
  }

  const savedTeamId = state.team?.team_id;
  state.team = state.teams.find((team) => team.team_id === savedTeamId) || state.teams[0];
  localStorage.setItem("ttm_team", JSON.stringify(state.team));
  return true;
}

function renderShell() {
  if (!state.user) return;

  els.userInitial.textContent = state.user.name.slice(0, 1).toUpperCase();
  els.userName.textContent = state.user.name;
  els.userId.textContent = `User ID ${state.user.user_id}`;
  els.teamIdStat.textContent = state.team?.team_id || "--";
  els.teamNameLabel.textContent = state.team?.name || `Team #${state.team?.team_id || "--"}`;
  els.taskCountStat.textContent = state.tasks.length;
  els.memberCountStat.textContent = state.members.length;
  renderTeamSelect();
}

function renderTeamSelect() {
  els.teamSelect.innerHTML = "";

  state.teams.forEach((team) => {
    const option = document.createElement("option");
    option.value = team.team_id;
    option.textContent = `${team.name} #${team.team_id}`;
    els.teamSelect.appendChild(option);
  });

  if (state.team) {
    els.teamSelect.value = state.team.team_id;
  }
}

function renderMembers() {
  els.memberList.innerHTML = "";
  els.assignTo.innerHTML = "";

  if (!state.members.length) {
    els.memberList.innerHTML = `<div class="member-pill"><span>No members loaded</span></div>`;
    return;
  }

  state.members.forEach((member) => {
    const row = document.createElement("div");
    row.className = "member-pill";
    row.innerHTML = `<strong>${member.name}</strong><span>ID ${member.user_id}</span>`;
    els.memberList.appendChild(row);

    const option = document.createElement("option");
    option.value = member.user_id;
    option.textContent = `${member.name} #${member.user_id}`;
    els.assignTo.appendChild(option);
  });

  if (state.user) {
    els.assignTo.value = state.user.user_id;
  }
}

function renderTasks() {
  els.taskList.innerHTML = "";

  const teamTasks = state.team
    ? state.tasks.filter((task) => task.team_id === state.team.team_id)
    : state.tasks;

  els.taskCountStat.textContent = teamTasks.length;

  if (!teamTasks.length) {
    els.taskList.innerHTML = `
      <div class="empty-state">
        <h2>No tasks yet</h2>
        <p>Add your first task for this team.</p>
      </div>
    `;
    return;
  }

  teamTasks.forEach((task) => {
    const assigned = state.members.find((member) => member.user_id === task.assigned_to);
    const card = document.createElement("article");
    card.className = `task-card ${task.status ? "done" : ""}`;
    card.innerHTML = `
      <div>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <div class="task-meta">Assigned to ${assigned?.name || `User #${task.assigned_to}`} · Task #${task.task_id}</div>
      </div>
      <div class="task-actions">
        <button data-action="status" data-id="${task.task_id}" data-status="${!task.status}">
          ${task.status ? "Undo" : "Done"}
        </button>
        <button data-action="delete" data-id="${task.task_id}">Delete</button>
      </div>
    `;
    els.taskList.appendChild(card);
  });
}

async function loadDashboard() {
  await loadTeams();
  if (!chooseFirstAvailableTeam()) {
    setView("team-choice");
    return;
  }

  state.members = await api(`/teams/${state.team.team_id}/members`, { headers: authHeaders() });
  state.tasks = await api("/tasks", { headers: authHeaders() });
  renderShell();
  renderMembers();
  renderTasks();
  setView("dashboard");
}

async function boot() {
  renderAuthMode();
  await checkApi();

  if (!state.token) {
    setView("auth");
    return;
  }

  try {
    await loadMe();
    await loadTeams();
    if (chooseFirstAvailableTeam()) {
      await loadDashboard();
    } else {
      setView("team-choice");
    }
  } catch {
    localStorage.removeItem("ttm_token");
    state.token = "";
    setView("auth");
  }
}

els.switchAuth.addEventListener("click", () => {
  state.signupMode = !state.signupMode;
  renderAuthMode();
});

els.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.authMessage.textContent = "";
  const name = els.authName.value.trim();
  const password = els.authPassword.value;

  try {
    if (state.signupMode) {
      await api("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      state.signupMode = false;
      renderAuthMode();
      showToast("User created. Login now.");
      return;
    }

    await login(name, password);
    await loadTeams();
    if (chooseFirstAvailableTeam()) {
      await loadDashboard();
    } else {
      setView("team-choice");
    }
  } catch (error) {
    els.authMessage.textContent = error.message;
  }
});

els.createTeamForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const team = await api("/teams", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name: els.teamName.value.trim() }),
    });
    state.team = team;
    await loadTeams();
    localStorage.setItem("ttm_team", JSON.stringify(team));
    await loadDashboard();
  } catch (error) {
    showToast(error.message);
  }
});

els.joinTeamForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const teamId = Number(els.joinTeamId.value);

  try {
    await api(`/teams/${teamId}/join`, {
      method: "POST",
      headers: authHeaders(),
    });
    await loadTeams();
    state.team = state.teams.find((team) => team.team_id === teamId) || { team_id: teamId, name: `Team #${teamId}`, owner_id: null };
    localStorage.setItem("ttm_team", JSON.stringify(state.team));
    await loadDashboard();
  } catch (error) {
    if (error.message === "Already In Team") {
      await loadTeams();
      state.team = state.teams.find((team) => team.team_id === teamId) || { team_id: teamId, name: `Team #${teamId}`, owner_id: null };
      localStorage.setItem("ttm_team", JSON.stringify(state.team));
      await loadDashboard();
      return;
    }
    showToast(error.message);
  }
});

els.switchTeamBtn.addEventListener("click", async () => {
  const teamId = Number(els.teamSelect.value);
  const team = state.teams.find((item) => item.team_id === teamId);

  if (!team) return;

  state.team = team;
  localStorage.setItem("ttm_team", JSON.stringify(state.team));
  await loadDashboard();
});

els.sidebarJoinTeamForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const teamId = Number(els.sidebarJoinTeamId.value);

  try {
    await api(`/teams/${teamId}/join`, {
      method: "POST",
      headers: authHeaders(),
    });
    await loadTeams();
    state.team = state.teams.find((team) => team.team_id === teamId) || state.team;
    localStorage.setItem("ttm_team", JSON.stringify(state.team));
    els.sidebarJoinTeamForm.reset();
    await loadDashboard();
    showToast("Joined team");
  } catch (error) {
    if (error.message === "Already In Team") {
      await loadTeams();
      state.team = state.teams.find((team) => team.team_id === teamId) || state.team;
      localStorage.setItem("ttm_team", JSON.stringify(state.team));
      els.sidebarJoinTeamForm.reset();
      await loadDashboard();
      showToast("Switched to that team");
      return;
    }
    showToast(error.message);
  }
});

els.leaveTeamBtn.addEventListener("click", async () => {
  if (!state.team) return;

  try {
    await api(`/teams/${state.team.team_id}/leave`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    await loadTeams();
    state.members = [];
    state.tasks = [];
    if (chooseFirstAvailableTeam()) {
      await loadDashboard();
    } else {
      setView("team-choice");
    }
    showToast("Left team");
  } catch (error) {
    showToast(error.message);
  }
});

function clearTeamSession() {
  state.team = null;
  state.teams = [];
  state.members = [];
  state.tasks = [];
  localStorage.removeItem("ttm_team");
}

els.logoutBtn.addEventListener("click", () => {
  state.token = "";
  state.user = null;
  clearTeamSession();
  localStorage.removeItem("ttm_token");
  setView("auth");
});

els.refreshBtn.addEventListener("click", async () => {
  try {
    await loadDashboard();
    showToast("Refreshed");
  } catch (error) {
    showToast(error.message);
  }
});

els.taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/tasks", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: els.taskTitle.value.trim(),
        description: els.taskDescription.value.trim(),
        team_id: state.team.team_id,
        assigned_to: Number(els.assignTo.value),
      }),
    });
    els.taskForm.reset();
    if (state.user) els.assignTo.value = state.user.user_id;
    await loadDashboard();
  } catch (error) {
    showToast(error.message);
  }
});

els.taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const taskId = button.dataset.id;

  try {
    if (button.dataset.action === "status") {
      await api(`/tasks/${taskId}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: button.dataset.status === "true" }),
      });
    }

    if (button.dataset.action === "delete") {
      await api(`/tasks/${taskId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
    }

    await loadDashboard();
  } catch (error) {
    showToast(error.message);
  }
});

boot();
