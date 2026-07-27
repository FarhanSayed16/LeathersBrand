import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import brand from '../brand'

const Login = ({ setToken }) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      if (response.data.success) {
        setToken(response.data.token)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-tz-pink-soft via-tz-cream to-tz-blue-soft px-4">

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-soft rounded-2xl px-8 py-10 border border-tz-pink/30">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-tz-navy font-display">
            {brand.admin?.panelTitle || `${brand.name} Admin`}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to manage your store
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 
                         focus:outline-none focus:ring-2 focus:ring-black 
                         focus:border-black transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 
                         focus:outline-none focus:ring-2 focus:ring-black 
                         focus:border-black transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-tz-navy text-white font-semibold 
                       hover:bg-tz-pink transition duration-200 active:scale-[0.98]"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {brand.admin?.panelTitle || `${brand.name} Admin`}
        </div>
      </div>
    </div>
  )
}

export default Login
