const API_URL = "http://localhost:5000/api";
let token = localStorage.getItem("token") || null;

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
