import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ name: "", comment: "", rating: 0 });
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    console.log("Product ID for review:", productId);
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const res = await axios.get(`${backendUrl}/api/reviews/${productId}`);
    setReviews(res.data);
    calculateAverage(res.data);
  };

  const calculateAverage = (reviewData) => {
    if (reviewData.length === 0) {
      setAverageRating(0);
      return;
    }
    const total = reviewData.reduce((sum, r) => sum + r.rating, 0);
    setAverageRating((total / reviewData.length).toFixed(1));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    await axios.post(`${backendUrl}/api/reviews`, { ...formData, productId });
    setFormData({ name: "", comment: "", rating: 0 });
    fetchReviews();
  };

  return (
    <div className="p-4 md:p-5 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-2">Customer Reviews</h2>

      {/* ⭐ Average Rating */}
      {reviews.length > 0 ? (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-yellow-500 text-lg">
            {[1, 2, 3, 4, 5].map((s) =>
              averageRating >= s ? <FaStar key={s} /> : <FaRegStar key={s} />
            )}
          </div>
          <span className="text-gray-700 text-sm">
            {averageRating} out of 5 ({reviews.length} review{reviews.length > 1 ? "s" : ""})
          </span>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No reviews yet.</p>
      )}

      {/* ➕ Add Review Form */}
      <form onSubmit={submitReview} className="mb-6 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-2 py-1 lg:py-2 w-full mb-3 rounded"
          required
        />
        <textarea
          placeholder="Your Comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="border p-2 w-full mb-3 rounded"
          required
        />
        <div className="flex gap-1 items-center text-yellow-500 text-xl mb-3">
         <span className=" text-black text-sm">Rate:</span>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} onClick={() => setFormData({ ...formData, rating: s })} className="cursor-pointer">
           
              {formData.rating >= s ? <FaStar /> : <FaRegStar />}
            </span>
          ))}
        </div>
        <button className="bg-tz-navy text-white hover:bg-tz-pink hover:text-white transition-colors duration-300 px-6 py-2 ">Submit</button>
      </form>

      {/* 📜 Show Individual Reviews */}
      <div className="space-y-4">
        
        {reviews.map((r, i) => (
          <div key={i} className="bg-white py-2 md:py-4 rounded shadow px-4">
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{r.name}</span>
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map((s) =>
                  r.rating >= s ? <FaStar key={s} /> : <FaRegStar key={s} />
                )}
              </div>
            </div>
            <p className="text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
