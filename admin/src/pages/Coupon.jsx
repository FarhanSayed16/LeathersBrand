import React, { useState, useEffect } from "react";
import { backendUrl } from '../App'
import axios from "axios";
 
const Coupon = ({ token }) => {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [message, setMessage] = useState("");
 
  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await axios.get(backendUrl+"/api/coupons", {
        headers: { token },
      });
      setCoupons(res.data.coupons);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to load coupons");
    }
  };
 
  // Create new coupon
  const createCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(backendUrl+
        "/api/coupons",
        { code, discount, expiry, usageLimit: usageLimit || 0 },
        { headers: { token } }
      );
      setMessage(res.data.message);
      setCode("");
      setDiscount("");
      setExpiry("");
      setUsageLimit("");
      fetchCoupons();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error creating coupon");
    }
  };
 
  // Delete a coupon
  const deleteCoupon = async (id) => {
    try {
      await axios.delete(backendUrl+`/api/coupons/${id}`, {
        headers: { token },
      });
      setMessage("Coupon deleted successfully");
      fetchCoupons();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete coupon");
    }
  };
 
  useEffect(() => {
    fetchCoupons();
  }, []);
 
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-tz-navy">Coupon Management</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-tz-navy/60">Create and manage your discount codes</p>
      </div>
 
      {message && (
        <div className="mb-6 p-4 rounded-xl bg-tz-blue-soft/50 border border-tz-blue/20">
          <p className="text-center text-tz-blue font-semibold text-sm">{message}</p>
        </div>
      )}
 
      {/* Create Coupon Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6 mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-tz-navy mb-4">Create New Coupon</h2>
        <form onSubmit={createCoupon} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-tz-navy/80 mb-1.5">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. SUMMER20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-tz-pink focus:border-tz-pink transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-tz-navy/80 mb-1.5">Discount %</label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-tz-pink focus:border-tz-pink transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-tz-navy/80 mb-1.5">Expiry Date</label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-tz-pink focus:border-tz-pink transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-tz-navy/80 mb-1.5">Usage Limit</label>
              <input
                type="number"
                placeholder="0 = Unlimited"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-tz-pink focus:border-tz-pink transition-colors"
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-tz-navy hover:bg-tz-pink text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>
 
      {/* List of Coupons */}
      <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-tz-navy mb-4">Existing Coupons</h2>
        {coupons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-tz-navy/50 text-sm">No coupons created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="border border-gray-100 bg-gray-50 p-4 rounded-xl flex justify-between items-start hover:border-tz-pink-soft transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-display font-bold text-lg text-tz-navy">{coupon.code}</span>
                    <span className="bg-tz-pink-soft/50 text-tz-pink px-2 py-0.5 rounded-full text-xs font-semibold">
                      {coupon.discount}% OFF
                    </span>
                  </div>
                  
                  <div className="space-y-1 mt-3">
                    <p className="text-xs text-tz-navy/60 font-medium">
                      Uses: <span className="text-tz-navy">{coupon.usedBy?.length || 0}</span>
                      {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : " (Unlimited)"}
                    </p>
                    <p className="text-xs text-tz-navy/60 font-medium">
                      Expires:{" "}
                      <span
                        className={
                          new Date(coupon.expiry) < new Date()
                            ? "text-tz-cherry"
                            : "text-[#4c8c7b]"
                        }
                      >
                        {new Date(coupon.expiry).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteCoupon(coupon._id)}
                  className="bg-white border border-tz-cherry/20 text-tz-cherry hover:bg-tz-cherry hover:text-white px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Coupon;