import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import { motion, AnimatePresence } from 'framer-motion'

const CartTotal = ({ isCart = false }) => {
  const { formatPrice, delivery_fee, getCartAmount, appliedCoupon } = useContext(ShopContext)
 
  const subTotal = getCartAmount();
  const discount = appliedCoupon ? Math.round((appliedCoupon.discount / 100) * subTotal) : 0;
  const total = subTotal === 0 ? 0 : subTotal + delivery_fee - discount;

  // Animation variants
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  const totalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className='w-full'
    >
      <div className='mb-4'>
        <Title text1={"CART"} text2={"TOTAL"} />
      </div>
 
      <div className='space-y-3 text-sm sm:text-base'>
        {/* SubTotal */}
        <motion.div 
          variants={itemVariants}
          className='flex justify-between items-center py-2'
        >
          <span className='text-gray-600'>SubTotal</span>
          <motion.span 
            className='font-medium'
            key={subTotal}
            initial={{ scale: 1.2, color: '#000' }}
            animate={{ scale: 1, color: '#374151' }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {formatPrice(subTotal)}
          </motion.span>
        </motion.div>
        
        <motion.hr 
          variants={itemVariants}
          className='border-gray-200' 
        />
 
        {/* Discount (if applied) */}
        <AnimatePresence>
          {appliedCoupon && (
            <>
              <motion.div 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ x: 20, opacity: 0 }}
                className='flex justify-between items-center py-2 text-green-600'
              >
                <span className='flex items-center gap-2'>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Discount ({appliedCoupon.code})
                </span>
                <motion.span 
                  className='font-medium'
                  key={discount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  - {formatPrice(discount)}
                </motion.span>
              </motion.div>
              <motion.hr 
                variants={itemVariants}
                className='border-gray-200' 
              />
            </>
          )}
        </AnimatePresence>
 
        {/* Shipping Fee */}
        <motion.div 
          variants={itemVariants}
          className='flex justify-between items-center py-2'
        >
          <span className='text-gray-600'>Shipping Fee</span>
          <motion.span 
            className='font-medium'
            animate={delivery_fee > 0 ? {
              scale: [1, 1.1, 1],
              transition: { duration: 0.3 }
            } : {}}
          >
            {formatPrice(delivery_fee)}
          </motion.span>
        </motion.div>
        
        <motion.hr 
          variants={itemVariants}
          className='border-gray-200' 
        />
 
        <motion.div 
          variants={totalVariants}
          className='flex justify-between items-center py-3'
        >
          <span className='text-base sm:text-lg font-bold'>Total</span>
          <motion.span 
            className='text-lg sm:text-xl font-bold text-tz-navy'
            key={total}
            animate={{ 
              scale: [1, 1.05, 1],
              transition: { duration: 0.5 }
            }}
          >
            {formatPrice(total)}
          </motion.span>
        </motion.div>
      </div>

      {/* Price Breakdown Pill (Mobile Only) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='mt-4 pt-4 border-t border-gray-200 flex justify-around text-xs sm:hidden'
      >
        <div className='text-center'>
          <div className='text-gray-500'>Subtotal</div>
          <div className='font-semibold'>{formatPrice(subTotal)}</div>
        </div>
        <div className='text-center'>
          <div className='text-gray-500'>Shipping</div>
          <div className='font-semibold'>{formatPrice(delivery_fee)}</div>
        </div>
        {appliedCoupon && (
          <div className='text-center'>
            <div className='text-gray-500'>Discount</div>
            <div className='font-semibold text-green-600'>-{formatPrice(discount)}</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
 
export default CartTotal