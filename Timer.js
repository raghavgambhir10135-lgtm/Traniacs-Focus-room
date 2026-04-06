import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Timer({ roomId }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const stopTimer = async () => {
    setRunning(false);
    await axios.put(`http://localhost:5000/room/${roomId}/focus`, {
      userId: "demoUser",
      focusTime: seconds
    });
    setSeconds(0);
  };

  return (
    <div>
      <p>⏱️ {seconds}s</p>
      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
