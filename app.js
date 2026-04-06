// Base API URL
const API_URL = "http://localhost:5000/api";

// Store token after login
let token = localStorage.getItem("token") || null;

// ==================== Theme Toggle ====================
document.getElementById("themeToggle").addEventListener("click", () => {
  const body = document.body;
  if (body.classList.contains("dark")) {
    body.classList.remove("dark");
    body.classList.add("read");
  } else if (body.classList.contains("read")) {
    body.classList.remove("read");
  } else {
    body.classList.add("dark");
  }
});

// ==================== Signup ====================
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.name.value,
      email: form.email.value,
      password: form.password.value
    })
  });
  const data = await res.json();
  alert(data.message);
});

// ==================== Login ====================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: form.email.value,
      password: form.password.value
    })
  });
  const data = await res.json();
  if (data.success) {
    token = data.token;
    localStorage.setItem("token", token);
    alert("Logged in successfully!");
    loadProfile();
    loadLeaderboard();
    loadRooms();
    loadRewards();
  } else {
    alert(data.message);
  }
});

// ==================== Profile Save ====================
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!token) return alert("Login first!");
  const form = e.target;
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      fullname: form.fullname.value,
      email: form.email.value,
      phone: form.phone.value,
      age: form.age.value,
      course: form.course.value
    })
  });
  const data = await res.json();
  alert(data.message);
});

// ==================== Badge Logic ====================
function getBadges(user) {
  const badges = [];
  if (user.streak >= 1) badges.push("Streak Starter");
  if (user.streak >= 7) badges.push("Focus Athlete");
  if (user.xp >= 500) badges.push("Mind Master");
  if (user.streak >= 30) badges.push("Consistency King");
  if (user.xp >= 1000) badges.push("Zen Mode");
  if (user.xp >= 2000) badges.push("Scholar");
  return badges;
}

// ==================== Level Logic ====================
function getLevel(xp) {
  if (xp >= 2000) return "Level 5 - Scholar";
  if (xp >= 1000) return "Level 4 - Zen Mode";
  if (xp >= 500) return "Level 3 - Mind Master";
  if (xp >= 100) return "Level 2 - Focus Starter";
  return "Level 1 - Beginner";
}

// ==================== Profile Load ====================
async function loadProfile() {
  if (!token) return;
  const res = await fetch(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  document.getElementById("xpValue").textContent = data.user.xp;
  document.getElementById("levelValue").textContent = getLevel(data.user.xp);

  // Show badges
  const badges = getBadges(data.user);
  const badgeList = document.getElementById("badges").querySelector("ul");
  badgeList.innerHTML = "";
  badges.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    badgeList.appendChild(li);
  });
}

// ==================== Rewards ====================
async function loadRewards() {
  if (!token) return;
  const res = await fetch(`${API_URL}/rewards/today`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  document.getElementById("streakDays").textContent = data.streak;
  document.getElementById("rewardInfo").textContent = data.reward || "None";
}

// ==================== Leaderboard ====================
async function loadLeaderboard() {
  const res = await fetch(`${API_URL}/leaderboard`);
  const data = await res.json();
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  data.forEach(user => {
    const badges = getBadges(user).join(", ");
    const li = document.createElement("li");
    li.textContent = `${user.name} - XP: ${user.xp} - Level: ${getLevel(user.xp)} - Badges: ${badges}`;
    list.appendChild(li);
  });
}

// ==================== Rooms ====================
async function loadRooms() {
  const res = await fetch(`${API_URL}/rooms`);
  const data = await res.json();
  const roomsSection = document.getElementById("rooms");
  const roomDivs = roomsSection.querySelectorAll(".room");
  roomDivs.forEach((div, i) => {
    const roomName = Object.keys(data.rooms)[i];
    div.querySelector("p span").textContent = data.rooms[roomName].activeUsers;
    div.querySelector("button").onclick = () => joinRoom(roomName);
  });
}

async function joinRoom(roomName) {
  if (!token) return alert("Login first!");
  const res = await fetch(`${API_URL}/rooms/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roomType: roomName })
  });
  const data = await res.json();
  alert(data.message);
}

// ==================== Chat Box (AI) ====================
document.getElementById("sendChat").addEventListener("click", async () => {
  const input = document.getElementById("chatInput");
  const chatWindow = document.getElementById("chatWindow");

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.textContent = "You: " + input.value;
  chatWindow.appendChild(userMsg);

  // Send to backend AI route
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: input.value })
  });
  const data = await res.json();

  // Show AI response
  const aiMsg = document.createElement("div");
  aiMsg.textContent = "AI: " + data.reply;
  chatWindow.appendChild(aiMsg);

  input.value = "";
});
