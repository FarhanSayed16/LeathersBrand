import React, { useContext, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const CouponInput = () => {
  const { backendUrl, token, appliedCoupon, setAppliedCoupon } =
    useContext(ShopContext)
  const [code, setCode] = useState('')

  const handleApplyCoupon = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/coupons/validate/${code}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.valid) {
        setAppliedCoupon({
          code: code.toUpperCase(),
          discount: res.data.discount,
        })
        toast.success(`Coupon applied! ${res.data.discount}% OFF`)
        setCode('')
      }
    } catch (err) {
      setAppliedCoupon(null)
      toast.error(err.response?.data?.error || 'Invalid coupon')
    }
  }

  return (
    <div className="mb-5">
      {appliedCoupon ? (
        <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded text-sm">
          <p>
            <b>{appliedCoupon.code}</b> ({appliedCoupon.discount}% OFF)
          </p>
          <button
            onClick={() => setAppliedCoupon(null)}
            className="text-red-500 text-xs"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            className="flex-1 border px-3 py-2 rounded text-sm"
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-tz-navy text-white hover:bg-tz-pink hover:text-white transition-colors duration-300 px-4 rounded text-sm"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}

export default CouponInput