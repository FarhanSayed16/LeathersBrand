import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Users = () => {
  const [users, setUsers] = useState([]);

  // Backend URL (use env or direct)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Token directly from localStorage
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await axios.get(
        `${backendUrl}/api/user/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setUsers(res.data.users);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-6">👥 Registered Users</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">#</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Verified</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">{index + 1}</td>

                  <td className="p-3 text-xs text-gray-500 break-all">
                    {user._id}
                  </td>

                  <td className="p-3">
                    {user.firstName} {user.lastName}
                  </td>

                  <td className="p-3">{user.email}</td>

                  <td className="p-3">{user.phone || "-"}</td>

                  <td className="p-3">
                    {user.isVerified ? (
                      <span className="text-green-600 font-semibold">
                        ✔ Verified
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        ✖ Not Verified
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-sm">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Users;