import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../App";

export default function AdminReview() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    outfit: "",
  });

  const [video, setVideo] = useState(null);
  const [reviews, setReviews] = useState([]);

  // 🔥 UI STATES
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef();

  // 🔥 DELETE MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // 🔥 GET REVIEWS
  const fetchReviews = () => {
    axios
      .get(`${backendUrl}/api/reviews`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 🔥 UPLOAD
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("video", video);
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("outfit", form.outfit);

    await axios.post(`${backendUrl}/api/reviews/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // ✅ UI reset (NO logic change)
    setLoading(false);
    setShowSuccess(true);

    setForm({
      title: "",
      description: "",
      outfit: "",
    });

    setVideo(null);
    fileInputRef.current.value = "";

    setTimeout(() => {
      setShowSuccess(false);
    }, 2200);

    fetchReviews();
  };

  // 🔥 OPEN MODAL
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  // 🔥 CONFIRM DELETE
  const confirmDelete = async () => {
    await axios.delete(`${backendUrl}/api/reviews/${deleteId}`);
    setShowModal(false);
    fetchReviews();
  };

  return (
    <div className="p-4 md:p-6 relative">

      {/* 🔥 SUCCESS CENTER CARD */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl text-center animate-scaleIn">
            
            <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center bg-green-100 rounded-full">
              <span className="text-green-600 text-2xl">✔</span>
            </div>

            <h2 className="text-lg font-bold text-gray-800">
              Upload Successful
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Your video has been uploaded successfully
            </p>
          </div>
        </div>
      )}

      {/* 🔥 UPLOAD FORM */}
      <div className="max-w-md mx-auto mb-10 bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-xl font-bold mb-5 text-center">
          Upload Review
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setVideo(e.target.files[0])}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black outline-none"
          />

          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black outline-none"
          />

          <input
            type="text"
            placeholder="Outfit"
            value={form.outfit}
            onChange={(e) =>
              setForm({ ...form, outfit: e.target.value })
            }
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black outline-none"
          />

          {/* 🔥 BUTTON WITH SPINNER */}
          <button
            disabled={loading}
            className={`w-full py-2 rounded text-white flex items-center justify-center gap-2 transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </button>
        </form>
      </div>

      {/* 🔥 VIDEO LIST */}
      <h2 className="text-xl font-bold mb-4 text-center md:text-left">
        Uploaded Reviews
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {reviews.map((item) => {
          const videoUrl = item.video;

          return (
            <div
              key={item._id}
              className="border rounded-xl overflow-hidden shadow hover:shadow-xl transition"
            >
              <video
                src={videoUrl}
                muted
                loop
                autoPlay
                playsInline
                className="w-full h-48 object-cover"
              />

              <div className="p-3">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-xs text-gray-500">
                  {item.description}
                </p>

                <button
                  onClick={() => openDeleteModal(item._id)}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded w-full"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 DELETE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-[300px] text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              Delete Review?
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this video?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 ANIMATION */}
      <style>
        {`
          .animate-scaleIn {
            animation: scaleIn 0.3s ease;
          }
          @keyframes scaleIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}