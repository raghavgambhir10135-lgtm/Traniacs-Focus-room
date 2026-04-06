import React from "react";

export default function Leaderboard({ rooms }) {
  const participants = rooms.flatMap(r => r.participants);
  const sorted = participants.sort((a, b) => b.focusTime - a.focusTime);

  return (
    <div>
      <h2>🏆 Leaderboard</h2>
      <ul>
        {sorted.map((p, i) => (
          <li key={i}>{p.userId} - {p.focusTime}s</li>
        ))}
      </ul>
    </div>
  );
}
