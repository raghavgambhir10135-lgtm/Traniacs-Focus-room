import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.body.className = theme; // apply theme class to body
  }, [theme]);

  return (
    <div className="app-container">
      <h1>FocusRoom</h1>
      <div className="theme-buttons">
        <button onClick={() => setTheme("dark")}>Dark</button>
        <button onClick={() => setTheme("light")}>Light</button>
        <button onClick={() => setTheme("read")}>Read</button>
      </div>
      <div className="main-layout">
        <div className="card">0 Active Users Right Now</div>
        <div className="card">18k Pomodoros Completed</div>
        <div className="card">640+ Rewards Unlocked Today</div>
      </div>
    </div>
  );
}

export default App;
