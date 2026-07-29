import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'

import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import brand from '../brand'
import { loadRazorpay } from '../utils/loadRazorpay'

const PlaceOrder = () => {
const [method, setMethod] = useState('razorpay')
const [isSubmitting, setIsSubmitting] = useState(false)
const [activeStep, setActiveStep] = useState(1)

const {
  navigate,
  token,
  backendUrl,
  cartItems,
  setCartItems,
  getCartAmount,
  delivery_fee,
  products,
  appliedCoupon,
  settings,
  formatPrice,
  selectedCurrency
} = useContext(ShopContext)

const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  phone: '',
})

const [pinCheck, setPinCheck] = useState({
  loading: false,
  serviceable: true,
  estimatedDays: null,
  estimatedRate: null,
  deliveryFee: null,
  warning: null,
  checked: false,
})

// ================= ANIMATION VARIANTS =================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
}

const paymentMethodVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  },
  tap: { scale: 0.98 }
}


// ================= LOGIN CHECK =================

useEffect(() => {
  if (!token) {
    toast.error("Please login first")
    navigate("/login")
  }
}, [token])


// ================= INPUT HANDLER =================

const onChangeHandler = (event) => {
  const name = event.target.name
  const value = event.target.value
  setFormData(data => ({ ...data, [name]: value }))
}

// ================= PINCODE SERVICEABILITY (Phase 3) =================

useEffect(() => {
  const pin = String(formData.zipcode || '').replace(/\D/g, '')
  if (pin.length !== 6 || !backendUrl) {
    setPinCheck((prev) => ({ ...prev, checked: false, warning: null }))
    return
  }

  let cancelled = false
  const timer = setTimeout(async () => {
    setPinCheck((prev) => ({ ...prev, loading: true }))
    try {
      const cod = method === 'COD' ? '1' : '0'
      const res = await axios.get(
        `${backendUrl}/api/shipping/serviceability`,
        { params: { pincode: pin, cod } }
      )
      if (cancelled) return
      if (res.data?.success) {
        setPinCheck({
          loading: false,
          checked: true,
          serviceable: res.data.serviceable !== false,
          estimatedDays: res.data.estimatedDays || null,
          estimatedRate: res.data.estimatedRate ?? null,
          deliveryFee: res.data.deliveryFee ?? delivery_fee,
          warning: res.data.warning || null,
          dynamicRates: Boolean(res.data.dynamicRates),
        })
      } else {
        setPinCheck({
          loading: false,
          checked: true,
          serviceable: true,
          estimatedDays: null,
          estimatedRate: null,
          deliveryFee: delivery_fee,
          warning: res.data?.message || null,
        })
      }
    } catch {
      if (!cancelled) {
        setPinCheck({
          loading: false,
          checked: true,
          serviceable: true,
          estimatedDays: null,
          estimatedRate: null,
          deliveryFee: delivery_fee,
          warning: 'Could not verify pincode — you can still place the order',
        })
      }
    }
  }, 450)

  return () => {
    cancelled = true
    clearTimeout(timer)
  }
}, [formData.zipcode, method, backendUrl, delivery_fee])

const partialConfig = settings?.partialPaymentConfig
const partialEnabled = Boolean(partialConfig?.enabled)
const hideClassicCod = partialEnabled && partialConfig?.replaceCod !== false

const orderTotalPreview = (() => {
  let total = getCartAmount() + (
    pinCheck.dynamicRates && pinCheck.deliveryFee != null
      ? pinCheck.deliveryFee
      : delivery_fee
  )
  if (appliedCoupon) {
    total -= Math.round((appliedCoupon.discount / 100) * getCartAmount())
  }
  return Math.max(0, total)
})()

const previewAdvance = (() => {
  if (!partialEnabled) return null
  const pct = Number(partialConfig.percent) || 20
  const minAdvance = Number(partialConfig.minAdvance) || 0
  const total = orderTotalPreview
  if (total <= 0) return { advanceAmount: 0, balanceAmount: 0, advancePercent: pct, orderTotal: 0 }
  let advanceAmount = Math.round((total * pct) / 100)
  if (advanceAmount < 1) advanceAmount = 1
  if (minAdvance > 0 && advanceAmount < minAdvance) {
    advanceAmount = total <= minAdvance ? total : minAdvance
  }
  if (advanceAmount > total) advanceAmount = total
  return {
    orderTotal: total,
    advancePercent: pct,
    advanceAmount,
    balanceAmount: total - advanceAmount,
  }
})()

// If classic COD is replaced by Partial, migrate selection
useEffect(() => {
  if (hideClassicCod && method === 'COD') {
    setMethod('partial')
  }
}, [hideClassicCod, method])


// ================= RAZORPAY INIT =================

const initPay = async (order, orderData, { verifyPath = '/api/order/verifyRazorpay', description = 'Order Payment' } = {}) => {
  try {
    await loadRazorpay()
  } catch {
    toast.error("Payment gateway failed to load")
    return
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: brand.commerce.razorpayDisplayName,
    description,
    order_id: order.id,

    handler: async function (response) {

      try {

        const verifyData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,

          items: orderData.items,
          amount: orderData.amount,
          address: orderData.address,
          orderFrom: "web",
          couponCode: appliedCoupon?.code,
        }

        const { data } = await axios.post(
          backendUrl + verifyPath,
          verifyData,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (data.success) {
          toast.success(verifyPath.includes('Partial') ? "Advance paid — order placed" : "Payment Successful")
          setCartItems({})
          navigate("/orders")
        } else {
          toast.error(data.message || "Payment Verification Failed")
        }

      } catch (error) {
        console.log(error)
        toast.error("Payment Error")
      }

    }
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}


// ================= SUBMIT HANDLER =================

const onSubmitHandler = async (event) => {

  event.preventDefault()
  setIsSubmitting(true)

  if (getCartAmount() === 0) {
    toast.error("Your cart is empty")
    setIsSubmitting(false)
    return
  }

  if (pinCheck.checked && pinCheck.serviceable === false) {
    toast.error("We cannot deliver to this pincode")
    setIsSubmitting(false)
    return
  }

  try {

    let orderItems = []

    for (const items in cartItems) {

      for (const size in cartItems[items]) {

        if (cartItems[items][size] > 0) {

          const product = products.find(p => p._id === items)

          if (product) {

            orderItems.push({
              _id: product._id,
              name: product.name,
              price: product.price,
              size: size,
              quantity: cartItems[items][size]
            })

          }
        }
      }
    }

    const effectiveDeliveryFee =
      pinCheck.dynamicRates && pinCheck.deliveryFee != null
        ? pinCheck.deliveryFee
        : delivery_fee

    let finalAmount = getCartAmount() + effectiveDeliveryFee

    if (appliedCoupon) {

      const discount = Math.round(
        (appliedCoupon.discount / 100) * getCartAmount()
      )

      finalAmount -= discount

    }

    const orderData = {
      address: formData,
      items: orderItems,
      amount: finalAmount
    }

    switch (method) {

      case 'COD':

        if (hideClassicCod) {
          toast.error("Cash on delivery requires an advance payment")
          break
        }

        const { data } = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (data.success) {

          toast.success("Order Placed Successfully")
          setCartItems({})
          navigate("/orders")

        } else {

          toast.error(data.message)

        }

        break


      case 'razorpay':

        const responseRazorpay = await axios.post(
          backendUrl + "/api/order/razorpay",
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (responseRazorpay.data.success) {

          const { order } = responseRazorpay.data

          initPay(order, orderData)

        } else {

          toast.error("Failed to initiate Razorpay")

        }

        break

      case 'partial': {
        if (!partialEnabled) {
          toast.error("Partial payment is not available")
          break
        }

        const responsePartial = await axios.post(
          backendUrl + "/api/order/partial",
          { amount: finalAmount },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (responsePartial.data.success) {
          initPay(responsePartial.data.order, orderData, {
            verifyPath: "/api/order/verifyPartial",
            description: `Advance ${responsePartial.data.paymentDetails?.advancePercent || partialConfig.percent}% payment`,
          })
        } else {
          toast.error(responsePartial.data.message || "Failed to start partial payment")
        }
        break
      }

      default:
        break
    }

  } catch (error) {

    console.log(error)
    toast.error("Something went wrong")

  } finally {

    setIsSubmitting(false)

  }

}

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={onSubmitHandler}
      className='min-h-screen bg-tz-cream px-4 py-6 sm:px-6 md:px-8 lg:px-12'
    >
      {/* Progress Indicator for Mobile */}
      <div className='flex justify-center items-center gap-2 mb-6 md:hidden'>
        <motion.div 
          className={`h-2 w-16 rounded-full ${activeStep === 1 ? 'bg-black' : 'bg-gray-300'}`}
          animate={{ scale: activeStep === 1 ? 1.1 : 1 }}
        />
        <motion.div 
          className={`h-2 w-16 rounded-full ${activeStep === 2 ? 'bg-black' : 'bg-gray-300'}`}
          animate={{ scale: activeStep === 2 ? 1.1 : 1 }}
        />
      </div>

      <div className='max-w-7xl mx-auto  flex flex-col lg:flex-row gap-6 lg:gap-12'>
        {/* LEFT SIDE - Delivery Information */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className='flex-1 w-full '
          onClick={() => setActiveStep(1)}
        >
          <div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6 md:p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 rounded-full bg-tz-navy text-white hover:bg-tz-pink hover:text-white transition-colors duration-300 flex items-center justify-center font-bold text-lg'>
                1
              </div>
              <Title text1={"DELIVERY"} text2={"INFORMATION"} />
            </div>

           <div className='space-y-4'>

  {/* Name */}
  <motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
    <div>
      <label className='label'>First Name</label>
      <motion.input required name='firstName' value={formData.firstName} onChange={onChangeHandler} placeholder='John' className='input' />
    </div>
    <div>
      <label className='label'>Last Name</label>
      <motion.input required name='lastName' value={formData.lastName} onChange={onChangeHandler} placeholder='Doe' className='input' />
    </div>
  </motion.div>

  {/* Email */}
  <motion.div variants={itemVariants}>
    <label className='label'>Email Address</label>
    <motion.input required type='email' name='email' value={formData.email} onChange={onChangeHandler} placeholder='john@example.com' className='input' />
  </motion.div>

  {/* Street */}
  <motion.div variants={itemVariants}>
    <label className='label'>Street Address</label>
    <motion.input required name='street' value={formData.street} onChange={onChangeHandler} placeholder='123 Main St' className='input' />
  </motion.div>

  {/* City + State */}
  <motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
    <div>
      <label className='label'>City</label>
      <motion.input required name='city' value={formData.city} onChange={onChangeHandler} placeholder='New York' className='input' />
    </div>
    <div>
      <label className='label'>State</label>
      <motion.input required name='state' value={formData.state} onChange={onChangeHandler} placeholder='NY' className='input' />
    </div>
  </motion.div>

  {/* Zip + Country */}
  <motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
    <div>
      <label className='label'>Pincode / Zipcode</label>
      <motion.input required type='text' inputMode='numeric' name='zipcode' value={formData.zipcode} onChange={onChangeHandler} placeholder='110001' className='input' maxLength={6} />
      {pinCheck.loading && (
        <p className='text-[11px] text-gray-500 mt-1'>Checking delivery…</p>
      )}
      {!pinCheck.loading && pinCheck.checked && pinCheck.serviceable && (
        <p className='text-[11px] text-[#4c8c7b] mt-1'>
          Delivery available
          {pinCheck.estimatedDays ? ` · ETA ${pinCheck.estimatedDays}` : ''}
          {pinCheck.dynamicRates && pinCheck.deliveryFee != null
            ? ` · shipping ${formatPrice(pinCheck.deliveryFee)}`
            : ''}
          {!pinCheck.dynamicRates && pinCheck.estimatedRate != null
            ? ` · courier est. ${formatPrice(pinCheck.estimatedRate)}`
            : ''}
        </p>
      )}
      {!pinCheck.loading && pinCheck.checked && !pinCheck.serviceable && (
        <p className='text-[11px] text-red-600 mt-1'>
          Sorry — we cannot deliver to this pincode yet.
        </p>
      )}
      {pinCheck.warning && pinCheck.serviceable && (
        <p className='text-[11px] text-amber-700 mt-1'>{pinCheck.warning}</p>
      )}
    </div>
    <div>
      <label className='label'>Country</label>
      <motion.input required name='country' value={formData.country} onChange={onChangeHandler} placeholder='India' className='input' />
    </div>
  </motion.div>

  {/* Phone */}
  <motion.div variants={itemVariants}>
    <label className='label'>Phone Number</label>
    <motion.input required type='number' name='phone' value={formData.phone} onChange={onChangeHandler} placeholder='+1 234 567 8900' className='input' />
  </motion.div>

</div>
          </div>
        </motion.div>

        {/* RIGHT SIDE - Cart Total & Payment */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className='w-full lg:w-[400px]'
          onClick={() => setActiveStep(2)}
        >
          <div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6 md:p-8 sticky top-4'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 rounded-full bg-tz-navy text-white hover:bg-tz-pink hover:text-white transition-colors duration-300 flex items-center justify-center font-bold text-lg'>
                2
              </div>
              <Title text1={"CART"} text2={"SUMMARY"} />
            </div>

            {/* Cart Total Component */}
            <div className='mb-8'>
              <CartTotal />
            </div>

            {method === 'partial' && previewAdvance && (
              <div className='mb-6 rounded-xl border border-tz-navy/10 bg-tz-cream/60 p-3 text-sm space-y-1'>
                <p className='font-semibold text-tz-navy'>Partial payment breakdown</p>
                <p className='text-gray-700 flex justify-between'><span>Pay now ({previewAdvance.advancePercent}%)</span><span>{formatPrice(previewAdvance.advanceAmount)}</span></p>
                <p className='text-gray-700 flex justify-between'><span>Pay on delivery</span><span>{formatPrice(previewAdvance.balanceAmount)}</span></p>
                <p className='text-[11px] text-gray-500 pt-1 leading-relaxed'>
                  {partialConfig?.policyNotice}
                </p>
              </div>
            )}

            {/* Payment Method */}
            <motion.div variants={itemVariants}>
              <Title text1={"PAYMENT"} text2={"METHOD"} />
              
              <div className='mt-4 space-y-3'>
                {/* Razorpay Option — full prepaid */}
                <motion.div
                  variants={paymentMethodVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setMethod('razorpay')}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                    method === 'razorpay' 
                      ? 'border-black bg-black/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method === 'razorpay' && (
                    <motion.div
                      layoutId="paymentIndicator"
                      className="absolute top-2 right-2 w-4 h-4 bg-black rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className='flex items-center gap-3'>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      method === 'razorpay' ? 'border-black' : 'border-gray-300'
                    }`}>
                      {method === 'razorpay' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-black rounded-full"
                        />
                      )}
                    </div>
                    <div>
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
                        alt="Razorpay" 
                        className='h-5 object-contain'
                      />
                      <p className='text-[11px] text-gray-500 mt-1'>Pay full amount online</p>
                    </div>
                  </div>
                </motion.div>

                {/* Partial payment */}
                {partialEnabled && (
                <motion.div
                  variants={paymentMethodVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setMethod('partial')}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                    method === 'partial' 
                      ? 'border-black bg-black/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method === 'partial' && (
                    <motion.div
                      layoutId="paymentIndicator"
                      className="absolute top-2 right-2 w-4 h-4 bg-black rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                  <div className='flex items-center gap-3'>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      method === 'partial' ? 'border-black' : 'border-gray-300'
                    }`}>
                      {method === 'partial' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-black rounded-full"
                        />
                      )}
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-700'>
                        {partialConfig?.label || `Pay ${partialConfig?.percent || 20}% now`}
                      </p>
                      <p className='text-[11px] text-gray-500 mt-0.5'>
                        Advance via Razorpay · rest on delivery
                        {previewAdvance ? ` · now ${formatPrice(previewAdvance.advanceAmount)}` : ''}
                      </p>
                    </div>
                  </div>
                </motion.div>
                )}

                {/* COD Option — hidden when Partial replaces COD */}
                {settings?.codEnabled && !hideClassicCod && (
                <motion.div
                  variants={paymentMethodVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setMethod('COD')}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                    method === 'COD' 
                      ? 'border-black bg-black/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method === 'COD' && (
                    <motion.div
                      layoutId="paymentIndicator"
                      className="absolute top-2 right-2 w-4 h-4 bg-black rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                  <div className='flex items-center gap-3'>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      method === 'COD' ? 'border-black' : 'border-gray-300'
                    }`}>
                      {method === 'COD' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-black rounded-full"
                        />
                      )}
                    </div>
                    <p className='text-sm font-medium text-gray-700'>
                      CASH ON DELIVERY
                    </p>
                  </div>
                </motion.div>
                )}
              </div>
            </motion.div>

            {/* Place Order Button */}
            <motion.div 
              variants={itemVariants}
              className='mt-8'
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type='submit'
                disabled={isSubmitting}
                className={`w-full bg-tz-navy text-white hover:bg-tz-pink hover:text-white transition-colors duration-300 uppercase py-4 px-6 rounded-xl text-sm font-semibold tracking-wider relative overflow-hidden transition-all duration-300 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  'Place Order'
                )}
              </motion.button>
            </motion.div>

            {/* Secure Payment Badge */}
            {selectedCurrency !== 'INR' && (
              <div className="mt-4 text-center text-[11.5px] text-gray-500 font-medium">
                *You will be charged in INR at checkout. Your bank will automatically convert this at their current rate.
              </div>
            )}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='mt-4 flex items-center justify-center gap-2 text-xs text-gray-500'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure Payment • 100% Protected</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .input-highlight {
          animation: highlight 0.3s ease-out;
        }
        
        @keyframes highlight {
          0% {
            background-color: rgba(0, 0, 0, 0.05);
            border-color: black;
          }
          100% {
            background-color: transparent;
            border-color: #e5e7eb;
          }
        }

        /* Remove spinner from number inputs */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </motion.form>
  )
}

export default PlaceOrder