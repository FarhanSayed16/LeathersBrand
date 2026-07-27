import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/contact`, {
        headers: { token: localStorage.getItem("token") },
      });
      if (res.data.success) setContacts(res.data.contacts || []);
    } catch {
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-tz-navy">Contact Messages</h2>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c._id} className="bg-white border border-tz-pink-soft rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <p className="font-semibold text-tz-navy">{c.name}</p>
                <p className="text-xs text-gray-400">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                </p>
              </div>
              <p className="text-sm text-gray-600">{c.email} · {c.phone}</p>
              <p className="text-sm mt-2 text-gray-800 whitespace-pre-wrap">{c.message}</p>
            </div>
          ))}
          {contacts.length === 0 && (
            <p className="text-gray-500 bg-white rounded-2xl border border-dashed p-8 text-center">
              No contact messages yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Contacts;
