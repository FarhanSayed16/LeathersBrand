import React, { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import SideBar from "./components/SideBar"
import { Route, Routes } from "react-router-dom"
import Add from "./pages/Add"
import List from "./pages/List"
import Orders from "./pages/Orders"
import Login from "./components/Login"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Edit from "./pages/Edit"
import Coupon from "./pages/Coupon"
import Dashboard from "./pages/Dashboard"
import Users from "./pages/Users"
import HeroUpload from "./pages/HeroUpload"
import Settings from "./pages/Settings"
import Categories from "./pages/Categories"
import InstagramPromos from "./pages/InstagramPromos"
import Review from "./pages/Review"
import Contacts from "./pages/Contacts"

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  )

  useEffect(() => {
    localStorage.setItem("token", token)
  }, [token])

  if (!token) {
    return (
      <>
        <ToastContainer />
        <Login setToken={setToken} />
      </>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-tz-cream">
      <ToastContainer />
      <Navbar setToken={setToken} />
      <div className="flex h-[calc(100vh-64px)]">
        <SideBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/add" element={<Add token={token} />} />
            <Route path="/list" element={<List token={token} />} />
            <Route path="/editProduct/:id" element={<Edit token={token} />} />
            <Route path="/orders" element={<Orders token={token} />} />
            <Route path="/coupons" element={<Coupon token={token} />} />
            <Route path="/users" element={<Users />} />
            <Route path="/admin/hero" element={<HeroUpload />} />
            <Route path="/review" element={<Review />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/instagram" element={<InstagramPromos />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
