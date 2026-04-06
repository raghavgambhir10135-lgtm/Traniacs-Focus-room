# FocusHub Backend API

Node.js + Express + MongoDB Atlas backend for the FocusHub app.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://raghavgambhir10135:<YOUR_PASSWORD>@ac-zfe5pim-shard-00-00.tu8fqrh.mongodb.net:27017,...
JWT_SECRET=your_strong_random_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

> ⚠️ Replace `<YOUR_PASSWORD>` in the MongoDB URI with your actual Atlas password.

### 3. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

All protected routes require header:
```
Authorization: Bearer <token>
```

---

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login & get token |
| GET | `/api/auth/me` | Yes | Get current user |

**Register body:**
```json
{ "name": "Raghav", "email": "you@example.com", "password": "yourpassword" }
```

**Login body:**
```json
{ "email": "you@example.com", "password": "yourpassword" }
```

---

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/api/profile` | Yes | Update profile |

**Body (all optional):**
```json
{
  "name": "Raghav",
  "phone": "+91 98765 43210",
  "age": 18,
  "course": "Computer Science",
  "avatar": "<base64 image string>"
}
```

---

### Pomodoro

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/pomodoro/complete` | Yes | Log a completed pomodoro (+50 XP) |
| GET | `/api/pomodoro/history` | Yes | Get last 50 sessions |
| GET | `/api/pomodoro/stats` | Yes | Get today's stats |

**Complete body:**
```json
{ "roomType": "study", "durationMinutes": 25 }
```

**XP Rules:**
- Each pomodoro = +50 XP
- 4 pomodoros in a day = +200 XP bonus
- Badges auto-awarded: First Focus 🍅, Focus Warrior ⚔️, Mind Master 🧠

---

### Leaderboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard` | No | Top 20 users by XP |
| GET | `/api/leaderboard/me` | Yes | Your rank |

---

### Rooms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rooms/join` | Yes | Join a room |
| POST | `/api/rooms/leave` | Yes | Leave a room |
| GET | `/api/rooms/stats` | No | Active users per room |
| POST | `/api/rooms/chat` | Yes | Send a chat message |
| GET | `/api/rooms/:roomType/messages` | Yes | Get recent 30 messages |

**Room types:** `study`, `meditate`, `yoga`, `read`, `interact`, `music`

**Join body:**
```json
{ "roomType": "study" }
```

**Chat body:**
```json
{ "roomType": "study", "message": "Let's go! 🎯" }
```

---

## Connecting the Frontend

In your `focushub_updated.html`, replace the `saveProfile()` and other functions to call the API.

Example — save profile:
```javascript
async function saveProfile() {
  const token = localStorage.getItem('fh_token');
  const data = {
    name: document.getElementById('pfName').value,
    email: document.getElementById('pfEmail').value,
    phone: document.getElementById('pfPhone').value,
    age: document.getElementById('pfAge').value,
    course: document.getElementById('pfCourse').value,
  };
  const res = await fetch('http://localhost:5000/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (result.success) showToast('✅', 'Profile Saved!', 'Your details have been updated.');
}
```

Example — complete pomodoro:
```javascript
async function pomComplete() {
  const token = localStorage.getItem('fh_token');
  const res = await fetch('http://localhost:5000/api/pomodoro/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ roomType: currentRoomType, durationMinutes: 25 })
  });
  const result = await res.json();
  if (result.success) {
    xp = result.user.xp;
    updateXP();
    showToast('🏆', 'Pomodoro Complete!', result.message);
  }
}
```

---

## Project Structure
```
focushub-backend/
├── server.js           # Entry point
├── .env.example        # Environment template
├── package.json
├── config/
│   └── db.js           # MongoDB Atlas connection
├── models/
│   ├── User.js         # User schema (auth + gamification)
│   ├── PomodoroSession.js
│   └── ChatMessage.js
├── routes/
│   ├── auth.js         # Register, login, me
│   ├── profile.js      # Update profile
│   ├── pomodoro.js     # Log sessions, history, stats
│   ├── leaderboard.js  # Top users
│   └── rooms.js        # Join/leave rooms, chat
└── middleware/
    └── auth.js         # JWT protection middleware
```
