const API_URL = "http://localhost:5000/api";
let token = localStorage.getItem("token") || null;

async function loadRewards() {
  if (!token) return;
  const res = await fetch(`${API_URL}/rewards/today`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  document.getElementById("streakDays").textContent = data.streak;
  document.getElementById("rewardInfo").textContent = data.reward || "None";
}
