import React from "react";
import Timer from "./Timer";

export default function Room({ room }) {
  return (
    <div className="room-card">
      <h3>{room.name}</h3>
      <Timer roomId={room._id} />
    </div>
  );
}
