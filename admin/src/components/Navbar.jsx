import React from "react"
import brand from "../brand"

const Navbar = ({ setToken }) => {
  return (
    <header className="h-16 w-full bg-white border-b shadow-sm flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-3">
        <img
          src={brand.logos.navbar}
          alt={brand.name}
          className="h-8 w-auto object-contain"
        />
        <span className="text-lg font-semibold text-gray-800 tracking-tight">
          <span className="text-gray-800">Admin</span>
        </span>
      </div>

      <button
        onClick={() => setToken("")}
        className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium
                   hover:bg-gray-900 transition active:scale-95"
      >
        Logout
      </button>
    </header>
  )
}

export default Navbar
