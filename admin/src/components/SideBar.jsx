import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import { assets } from "../assets/assets"
import { Menu } from "lucide-react"
import brand from "../brand"

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition
     ${isActive ? "bg-tz-navy text-white" : "text-tz-navy hover:bg-tz-pink-soft"}`

  return (
    <aside
      className={`h-full bg-white border-r border-tz-pink-soft transition-all duration-300
      ${isOpen ? "w-64" : "w-20"}`}
    >
      <div className="flex justify-around items-center p-3 border-b border-tz-pink-soft">
        {isOpen && <p className="font-brand font-bold text-tz-navy text-sm">{brand.admin.panelTitle}</p>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-tz-pink-soft"
        >
          <Menu size={18} className="text-tz-navy" />
        </button>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-56px)]">
        {isOpen && <p className="text-[10px] font-bold text-tz-navy/40 uppercase tracking-wider mt-2 px-4">Dashboard</p>}
        <NavLink to="/" end className={linkClass}>
          <img src={assets.add_icon} className="w-5 h-5" alt="" />
          {isOpen && "Overview"}
        </NavLink>

        {isOpen && <p className="text-[10px] font-bold text-tz-navy/40 uppercase tracking-wider mt-4 px-4">Catalog</p>}
        <NavLink to="/add" className={linkClass}>
          <img src={assets.add_icon} className="w-5 h-5" alt="" />
          {isOpen && "Add Products"}
        </NavLink>
        <NavLink to="/list" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "List Products"}
        </NavLink>
        <NavLink to="/categories" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Categories"}
        </NavLink>

        {isOpen && <p className="text-[10px] font-bold text-tz-navy/40 uppercase tracking-wider mt-4 px-4">Sales</p>}
        <NavLink to="/orders" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Orders"}
        </NavLink>
        <NavLink to="/coupons" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Coupons"}
        </NavLink>
        <NavLink to="/users" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Users"}
        </NavLink>
        <NavLink to="/contacts" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Contacts"}
        </NavLink>

        {isOpen && <p className="text-[10px] font-bold text-tz-navy/40 uppercase tracking-wider mt-4 px-4">Storefront CMS</p>}
        <NavLink to="/admin/hero" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Hero Banners"}
        </NavLink>
        <NavLink to="/instagram" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Instagram"}
        </NavLink>
        <NavLink to="/review" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Upload Review"}
        </NavLink>

        {isOpen && <p className="text-[10px] font-bold text-tz-navy/40 uppercase tracking-wider mt-4 px-4">System</p>}
        <NavLink to="/settings" className={linkClass}>
          <img src={assets.order_icon} className="w-5 h-5" alt="" />
          {isOpen && "Settings"}
        </NavLink>
      </nav>
    </aside>
  )
}

export default SideBar
