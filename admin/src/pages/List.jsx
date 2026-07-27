import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import brand from '../brand'

const List = ({ token }) => {

  // ===============================
  // ORIGINAL STATE (UNCHANGED LOGIC)
  // ===============================
  const [list, setList] = useState([])
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState("All")

  // ===============================
  // UI STATES (NEW – ONLY UI)
  // ===============================
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const DEPT_FILTERS = [
    { key: "All", label: "All" },
    { key: "men", label: "Men" },
    { key: "women", label: "Women" },
    { key: "bags", label: "Bags" },
    { key: "accessories", label: "Accessories" },
    { key: "home-living", label: "Home" },
    { key: "sale", label: "Sale" },
  ];

  const currentList =
    selectedCategory === "All"
      ? list
      : list.filter(
          (item) =>
            item.department === selectedCategory ||
            item.category === selectedCategory
        );
  // ===============================
  // PAGINATION LOGIC
  // ===============================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = currentList.slice(startIndex, endIndex);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // ===============================
  // FETCH LIST (UNCHANGED)
  // ===============================
  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list")
      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // ===============================
  // DELETE PRODUCT (LOGIC SAME)
  // ===============================
  const removeProduct = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id: deleteId },
        { headers: { token } }
      )

      if (response.data.success) {
        await fetchList()

        // 🔥 CENTER SUCCESS MESSAGE
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1500)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setShowConfirm(false)
      setDeleteId(null)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className="p-3 sm:p-6">

      <p className='mb-3 font-semibold'>ALL Products List</p>

      {/* Toggle Buttons */}
      <div className="flex flex-wrap w-full sm:w-auto my-5 border rounded-xl overflow-hidden">
        {DEPT_FILTERS.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 text-sm font-medium ${
              selectedCategory === cat.key
                ? "bg-tz-navy text-white"
                : "bg-tz-pink-soft text-tz-navy"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      {currentList.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">

            {/* Header */}
            <div className='grid grid-cols-[80px_2fr_1fr_1fr_1fr_80px_80px] bg-gray-100 p-2 text-sm font-semibold'>
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span>Qty</span>
              <span className='text-center'>Delete</span>
              <span className='text-center'>Edit</span>
            </div>

            {/* Rows */}
            {paginatedList.map(item => (
              <div
                key={item._id}
                className='grid grid-cols-[80px_2fr_1fr_1fr_1fr_80px_80px] items-center p-2 border-b text-sm'
              >
                <img src={item.image?.[0]} className='w-14 h-14 object-cover rounded' />
                <p>{item.name}{item.featured ? " ★" : ""}{item.bestseller ? " • BS" : ""}</p>
                <p>{item.department || item.category}{item.categorySlug ? ` / ${item.category}` : item.subCategory ? ` / ${item.subCategory}` : ""}</p>
                <p>₹{item.price}</p>
                <p>{item.availableQuantity}</p>

                {/* Delete */}
                <div className='flex justify-center'>
                  <FaTrash
                    className="text-red-500 cursor-pointer"
                    onClick={() => {
                      setDeleteId(item._id)
                      setShowConfirm(true)
                    }}
                  />
                </div>

                {/* Edit */}
                <div className='flex justify-center'>
                  <FaEdit
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/editProduct/${item._id}`, { state: item })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Nothing</p>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded text-sm ${
              currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded text-sm ${
              currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ================= CONFIRM DELETE MODAL ================= */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-[320px] animate-scale">
            <h3 className="text-lg font-semibold text-center">Delete Product</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Are you sure you want to delete this product?
            </p>
            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 py-2 bg-gray-200 rounded"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 bg-red-500 text-white rounded"
                onClick={removeProduct}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS CENTER MESSAGE ================= */}
      {showSuccess && (
       <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <p className="success-text">Product removed successfully</p>
          </div>
        </div>
      )}

    </div>
  )
}

export default List