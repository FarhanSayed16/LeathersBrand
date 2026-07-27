import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets.js'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import brand from '../brand'

const Add = ({token}) => {
  // All your state remains exactly the same
  const [image1,setImage1]=useState(false)
  const [image2,setImage2]=useState(false)
  const [image3,setImage3]=useState(false)
  const [image4,setImage4]=useState(false)

  const [sizeimage1,setSizeimage1]=useState(false)
  const [sizeimage2,setSizeimage2]=useState(false)

  const [name,setName]=useState("")
  const [secondaryName,setSecondaryName]=useState("")
  const [description,setDescription]=useState("")
  const [price,setPrice]=useState("")
  const [categoryId, setCategoryId] = useState("")
  const [bestseller, setBestseller] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [sizes, setSizes] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [material, setMaterial] = useState("");
  const [dimensions, setDimensions] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/categories`);
      if (res.data.success) {
        setDbCategories(res.data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const leafCategories = dbCategories.filter((c) => c.type === "category");
  const selectedLeaf = leafCategories.find((c) => c._id === categoryId);
  const [oldPrice,setOldPrice]=useState("")
  const [discount,setDiscount]=useState("")
  const [color,setColor]=useState("")
  const [availableQuantity,setAvailableQuantity]=useState("")

  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [parentId, setParentId] = useState("");

  // Handle form submission with confirmation
  const handleSubmitWithConfirmation = (e) => {
    e.preventDefault()
    setShowConfirmationPopup(true)
  }

  // Handle actual form submission
  const onSubmitHandler = async() => {
    try {
        setShowConfirmationPopup(false)
        
        const formData = new FormData()
        formData.append("name",name)
        formData.append("secondaryName",secondaryName)
        formData.append("parentId", parentId)
        formData.append("description",description)
        formData.append("price",price)
        formData.append("oldPrice",oldPrice)
        formData.append("discount",discount)
        formData.append("material",material)
        formData.append("dimensions",dimensions)
        formData.append("categoryId", categoryId)
        if (selectedLeaf) {
          formData.append("category", selectedLeaf.name)
          formData.append("subCategory", selectedLeaf.name)
        }
        formData.append("availableQuantity",availableQuantity)
        formData.append("bestseller",bestseller)
        formData.append("featured",featured)
        formData.append("tags",tags)
        formData.append("color",color)
        formData.append("sizes",JSON.stringify(sizes.length ? sizes : ["One Size"]))

        image1 && formData.append("image1",image1)
        image2 && formData.append("image2",image2)
        image3 && formData.append("image3",image3)
        image4 && formData.append("image4",image4)

        sizeimage1 && formData.append("sizeimage1",sizeimage1)
        sizeimage2 && formData.append("sizeimage2",sizeimage2)

        const response = await axios.post(backendUrl+'/api/product/add',formData,{headers:{token}})
        
        if(response.data.success){
          setSuccessMessage(response.data.message)
          setShowSuccessPopup(true)
          
          setName('')
          setSecondaryName('')
          setDescription('')
          setPrice('')
          setSizes('')
          setBestseller('')
          setColor('')
          setMaterial('')
          setDimensions('')
          setOldPrice('')
          setDiscount('')
          setAvailableQuantity('')
          setCategoryId('')
          setImage1('')
          setImage2('')
          setImage3('')
          setImage4('')
          setSizeimage1('')
          setSizeimage2('')
        }else{
          toast.error(response.data.message, {
            position: "top-center",
            theme: "colored"
          });
        }
      } catch (error) {
          console.log(error)
          toast.error(error.message, {
            position: "top-center",
            theme: "colored"
          });
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 relative">
      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-tz-pink-soft rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-tz-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Product Addition</h3>
              <p className="text-gray-600 text-center mb-6">Are you sure you want to add this product to your inventory?</p>
              
              {/* Product Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Product Summary:</h4>
                <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {name || 'Not specified'}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Price:</span> ${price || 'Not specified'}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Category:</span> {selectedLeaf ? `${selectedLeaf.path || selectedLeaf.name}` : 'Not specified'}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Color:</span> {color || 'Not specified'}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmationPopup(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmitHandler}
                  className="flex-1 px-4 py-2 bg-tz-navy hover:bg-tz-pink text-white font-medium rounded-lg transition-colors"
                >
                  Confirm & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Success!</h3>
              <p className="text-gray-600 text-center mb-6">{successMessage || 'Product added successfully!'}</p>
              
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full px-4 py-2 bg-tz-navy hover:bg-tz-pink text-white font-medium rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{brand.admin.addProductTitle}</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Fill in the details below to add a new product to your inventory</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitWithConfirmation} className="space-y-6 sm:space-y-8">
          {/* Image Upload Section - Medium size */}
          <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-tz-navy mb-2 sm:mb-4">Product Images</h2>
            <p className="text-xs sm:text-sm text-tz-navy/60 mb-3 sm:mb-4">Upload up to 4 product images</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((num) => {
                const imageState = eval(`image${num}`);
                const setImage = eval(`setImage${num}`);
                return (
                  <label key={num} htmlFor={`image${num}`} className="cursor-pointer group">
                    <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors overflow-hidden bg-gray-50">
                      <img 
                        className="w-full h-full object-cover" 
                        src={!imageState ? assets.upload_area : URL.createObjectURL(imageState)}
                        alt={`Upload ${num}`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                          {imageState ? 'Change' : 'Upload'}
                        </span>
                      </div>
                    </div>
                    <input type='file' id={`image${num}`} hidden onChange={(e)=>setImage(e.target.files[0])}/>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-tz-navy mb-3 sm:mb-4">Basic Information</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    onChange={(e)=>setName(e.target.value)} 
                    value={name} 
                    type='text' 
                    placeholder='e.g., Men Black Leather Biker Jacket' 
                    required 
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Secondary Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    onChange={(e)=>setSecondaryName(e.target.value)} 
                    value={secondaryName} 
                    type='text' 
                    placeholder='Same name for different colors' 
                    required 
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="mt-1 text-[10px] sm:text-xs text-gray-500">Use same name for products with different colors</p>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Parent Product ID (same for color variants)
                </label>
                <input
                  type="text"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  placeholder="e.g. men-black-biker-jacket-01"
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use SAME Parent ID for same product with different colors
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  onChange={(e)=>setDescription(e.target.value)} 
                  value={description} 
                  placeholder='Write a detailed description of your product...' 
                  required 
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Inventory & Categorization */}
          <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-tz-navy mb-3 sm:mb-4">Inventory & Categorization</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
              
              <div className="xl:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Quantity</label>
                <input
                  type="number"
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 50"
                  value={availableQuantity}
                />
              </div>

              <div className="xl:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Color</label>
                <select 
                  onChange={(e)=>setColor(e.target.value)} 
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={color}
                >
                  <option value="NotSelected">Select</option>
                  <option value="Red">Red</option>
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Green">Green</option>
                  <option value="Blue">Blue</option>
                  <option value="Pink">Pink</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Orange">Orange</option>
                  <option value="Purple">Purple</option>
                  <option value="Cream">Cream</option>
                  <option value="Navy">Navy</option>
                  <option value="Multi">Multi</option>
                </select>
              </div>

              <div className="xl:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
                <select 
                  onChange={(e)=>setCategoryId(e.target.value)} 
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-tz-pink focus:border-tz-pink bg-white"
                  value={categoryId}
                  required
                >
                  <option value="">Select leaf category</option>
                  {leafCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.path || c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  {leafCategories.length
                    ? "Pick from the Afiya category tree (seed if empty)."
                    : "No categories — run npm run seed:categories in backend."}
                </p>
              </div>

              <div className="xl:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Material</label>
                <input 
                  onChange={(e)=>setMaterial(e.target.value)} 
                  value={material}
                  type="text"
                  placeholder="e.g. Genuine leather"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="xl:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Dimensions</label>
                <input 
                  onChange={(e)=>setDimensions(e.target.value)} 
                  value={dimensions}
                  type="text"
                  placeholder="e.g. Chest 42 in / Length 26 in"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-tz-navy mb-3 sm:mb-4">Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Price ($)</label>
                <input 
                  onChange={(e)=>setPrice(e.target.value)} 
                  value={price} 
                  type='number' 
                  placeholder='29.99' 
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Old Price ($)</label>
                <input 
                  onChange={(e)=>setOldPrice(e.target.value)} 
                  value={oldPrice} 
                  type='number' 
                  placeholder='39.99' 
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Discount (%)</label>
                <input 
                  onChange={(e)=>setDiscount(e.target.value)} 
                  value={discount} 
                  type='number' 
                  placeholder='25' 
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sizes and Size Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-tz-navy mb-3 sm:mb-4">Sizes & Size Chart</h2>
            
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Available Sizes</label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSizes(prev => 
                      prev.includes(size) 
                        ? prev.filter(item => item !== size) 
                        : [...prev, size]
                    )}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                      sizes.includes(size) 
                        ? 'bg-tz-navy text-white shadow-sm scale-105' 
                        : 'bg-white border border-tz-pink-soft text-tz-navy/80 hover:bg-tz-pink-soft/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Size Chart Images</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {[1, 2].map((num) => {
                  const imageState = eval(`sizeimage${num}`);
                  const setImage = eval(`setSizeimage${num}`);
                  return (
                    <label key={num} htmlFor={`sizeimage${num}`} className="cursor-pointer group">
                      <div className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors overflow-hidden bg-gray-50">
                        <img 
                          className="w-full h-full object-cover" 
                          src={!imageState ? assets.upload_area : URL.createObjectURL(imageState)}
                          alt={`Size Chart ${num}`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                            {imageState ? 'Change' : 'Upload'}
                          </span>
                        </div>
                      </div>
                      <input type='file' id={`sizeimage${num}`} hidden onChange={(e)=>setImage(e.target.files[0])}/>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Merchandising flags */}
          <div className="bg-white rounded-2xl shadow-sm border border-tz-pink-soft p-4 sm:p-6 space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                onChange={() => setBestseller(prev => !prev)} 
                checked={bestseller} 
                type='checkbox' 
                id='bestseller'
                className="w-4 h-4 sm:w-5 sm:h-5 text-tz-pink rounded border-gray-300 focus:ring-tz-pink"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Mark as bestseller</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                onChange={() => setFeatured(prev => !prev)} 
                checked={featured} 
                type='checkbox' 
                className="w-4 h-4 sm:w-5 sm:h-5 text-tz-pink rounded border-gray-300 focus:ring-tz-pink"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Feature on homepage</span>
            </label>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tags / vibes (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="leather, biker, black, jacket"
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button 
              type='submit' 
              className="px-6 sm:px-8 py-2 sm:py-3 bg-tz-navy hover:bg-tz-pink text-white text-sm sm:text-base font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-tz-pink focus:ring-offset-2"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Add custom animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Add