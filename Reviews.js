import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Reviews({ outletId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");

useEffect(() => {
  axios.get(`http://localhost:5000/outlets/${outletId}/reviews`)
    .then((res) => setReviews(res.data));
}, [outletId]);

const submitReview = () => {
  axios.post(`http://localhost:5000/outlets/${outletId}/reviews`, { comment: newReview })
    .then((res) => setReviews([...reviews, res.data]));
  setNewReview("");
};


  return (
    <div className="reviews">
      <h4>Reviews</h4>
      {reviews.map((r, i) => (
        <p key={i}><strong>{r.user}</strong>: {r.comment}</p>
      ))}
      <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} />
      <button onClick={submitReview} className="btn">Submit Review</button>
    </div>
  );
}
