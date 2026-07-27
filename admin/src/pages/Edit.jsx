import React from 'react'
import { assets } from '../assets/assets.js'
import { useState } from 'react';
import{useLocation} from 'react-router-dom'
import { useEffect } from 'react';
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

  
const Edit = ({token}) => {

  // const [product,setProduct]=useState()
  const location = useLocation()
  

  const items = location.state
  console.log(items)

  const [name,setName]=useState("")
  const [secondaryName,setSecondaryName]=useState("")
  const [description,setDescription]=useState("")

  const [categoryId, setCategoryId] = useState("")
  const [material,setMaterial]=useState("")
  const [dimensions,setDimensions]=useState("")
  
  const [bestseller,setBestseller]=useState(false)
  const [featured,setFeatured]=useState(false)
  const [tags,setTags]=useState("")
  const [sizes,setSizes]=useState([])
  
  const [dbCategories, setDbCategories] = useState([]);

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

  const [color,setColor]=useState("")
  const [availableQuantity,setAvailableQuantity]=useState("")
  const [price,setPrice]=useState("")
  const [oldPrice,setOldPrice]=useState("")
  const [discount,setDiscount]=useState("")

  const [image1,setImage1]=useState(null)
  const [image2,setImage2]=useState(null)
  const [image3,setImage3]=useState(null)
  const [image4,setImage4]=useState(null)

  const [sizeimage1,setSizeimage1]=useState(false)
  const [sizeimage2,setSizeimage2]=useState(false)

  const onSubmitHandler = async(e)=>{
    try {
        e.preventDefault()
        
          const formData = new FormData()
          formData.append("name",name)
          formData.append("secondaryName",secondaryName)
          formData.append("description",description)
          formData.append("price",price)
          formData.append("oldPrice",oldPrice)
          formData.append("discount",discount)
          formData.append("material",material)
          formData.append("dimensions",dimensions)
          if (categoryId) formData.append("categoryId", categoryId)
          if (selectedLeaf) {
            formData.append("category", selectedLeaf.name)
            formData.append("subCategory", selectedLeaf.name)
          }
          formData.append("availableQuantity",availableQuantity)
          formData.append("bestseller",bestseller)
          formData.append("featured",featured)
          formData.append("tags",tags)
          formData.append("color",color)
          formData.append("sizes",JSON.stringify(sizes))

          image1 && formData.append("image1",image1)
          image2 && formData.append("image2",image2)
          image3 && formData.append("image3",image3)
          image4 && formData.append("image4",image4)

          sizeimage1 && formData.append("sizeimage1",sizeimage1)
          sizeimage2 && formData.append("sizeimage2",sizeimage2)


          const response = await axios.put(backendUrl+`/api/product/edit/${items._id}`,formData,{headers:{token}})
          if(response.data.success){
            toast.success(response.data.message)
            setName('')
            setDescription('')
            setPrice('')
            setSizes('')
            setBestseller('')
            setColor('')
            setMaterial('')
            setDimensions('')
            setOldPrice('')
            setDiscount('')
            setImage1('')
            setImage2('')
            setImage3('')
            setImage4('')
            setSizeimage1('')
            setSizeimage2('')
          }else{
            toast.error(response.data.message)
          }
          // console.log(response.data)

      } catch (error) {
          console.log(error)
          toast.error(error.message)
      }
  }

  useEffect(()=>{
    if(items){  
      setName(items.name || '')
      setSecondaryName(items.secondaryName || '')
      setDescription(items.description||'')
      setPrice(items.price||'')
      setOldPrice(items.oldPrice||'')
      setDiscount(items.discount||'')
      setAvailableQuantity(items.availableQuantity||'')
      setColor(items.color||'')
      setCategoryId(items.categoryId || '')
      setMaterial(items.material||'')
      setDimensions(items.dimensions||'')
      setSizes(items.sizes||[])
      setBestseller(items.bestseller||false)
      setFeatured(items.featured||false)
      setTags(Array.isArray(items.tags) ? items.tags.join(", ") : (items.tags || ""))
     
    }

  },[items])


  return (
    <div>
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>

        {/* Image Uploads */}
        <div>
          <p className='mb-2'>Upload Image</p>
          <div className='flex gap-2'>
            <label htmlFor='image1'>
              <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}/>
              <input type='file' id='image1' hidden onChange={(e)=>setImage1(e.target.files[0])} />
            </label>
            <label htmlFor='image2'>
              <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} />
              <input type='file' id='image2' hidden onChange={(e)=>setImage2(e.target.files[0])}/>
            </label>
            <label htmlFor='image3'>
              <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} />
              <input type='file' id='image3' hidden onChange={(e)=>setImage3(e.target.files[0])}/>
            </label>
            <label htmlFor='image4'>
              <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} />
              <input type='file' id='image4' hidden onChange={(e)=>setImage4(e.target.files[0])}/>
            </label>
          </div>
        </div>

        {/* Product Name */}
       


        <div className=' flex gap-5 items-center justify-center'>
          <div className=' w-full text-sm'>
             <p className=' mb-1'>Product Name</p>
             <input onChange={(e)=>setName(e.target.value)} value={name} type='text' placeholder='Type here' required className=' w-full max-w-[500px] py-2 px-3'/>
          </div>
          <div className=' w-full text-sm'>
             <p className=' mb-1'>Product SecondaryName-Add Same Name for same specification for different color</p>
             <input onChange={(e)=>setSecondaryName(e.target.value)} value={secondaryName} type='text' placeholder='Type here' required className=' w-full max-w-[500px] py-2 px-3'/>
          </div>
        </div>



        {/* Product Description */}
        <div className='w-full text-sm'>
          <p className='mb-1'>Product Description</p>
          <textarea type='text' placeholder='Write Description' required className='w-full max-w-[500px] py-2 px-3' onChange={(e)=>setDescription(e.target.value)} value={description} />
        </div>

        {/* Inventory & Categorization */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mt-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Inventory & Categorization</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 text-sm">
            
            <div className="xl:col-span-1">
              <label className="block font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                onChange={(e) => setAvailableQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 50"
                value={availableQuantity}
              />
            </div>

            <div className="xl:col-span-1">
              <label className="block font-medium text-gray-700 mb-1">Color</label>
              <select 
                onChange={(e)=>setColor(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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
              <label className="block font-medium text-gray-700 mb-1">Category</label>
                <select 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg bg-white"
                  value={categoryId}
                >
                  <option value="">Select leaf category</option>
                  {leafCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.path || c.name}</option>
                  ))}
                </select>
            </div>

            <div className="xl:col-span-1">
              <label className="block font-medium text-gray-700 mb-1">Material</label>
              <input 
                onChange={(e)=>setMaterial(e.target.value)} 
                value={material}
                type="text"
                placeholder="e.g. Genuine leather"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="xl:col-span-1">
              <label className="block font-medium text-gray-700 mb-1">Dimensions</label>
              <input 
                onChange={(e)=>setDimensions(e.target.value)} 
                value={dimensions}
                type="text"
                placeholder="e.g. Chest 42 in / Length 26 in"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>
        </div>

        {/* Prices */}
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8 mt-5 text-sm'>
          <div>
            <p className='mb-1'>Product Price</p>
            <input onChange={(e)=>setPrice(e.target.value)} value={price} type='Number' placeholder='25' className='w-full px-3 py-2 sm:w-[120px]' />
          </div>
          <div>
            <p className='mb-1'>Product OldPrice</p>
            <input onChange={(e)=>setOldPrice(e.target.value)} value={oldPrice} type='Number' placeholder='25' className='w-full px-3 py-2 sm:w-[120px]' />
          </div>
          <div>
            <p className='mb-1'>Product Discount</p>
            <input onChange={(e)=>setDiscount(e.target.value)} value={discount} type='Number' placeholder='25' className='w-full px-3 py-2 sm:w-[120px]' />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <p className='mb-1'>Product Sizes</p>
         <div className=' flex gap-3'>
            <div onClick={()=>setSizes(prev=>prev.includes("S")? prev.filter(item=>item!== "S") : [...prev,"S"])}>
              <p className={` ${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}  >S</p>
            </div>
            <div onClick={()=>setSizes(prev=>prev.includes("M")? prev.filter(item=>item!== "M") : [...prev,"M"])}>
              <p className={` ${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>M</p>
            </div>
            <div onClick={()=>setSizes(prev=>prev.includes("L")? prev.filter(item=>item!== "L") : [...prev,"L"])}>
              <p className={` ${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>L</p>
            </div>
            <div onClick={()=>setSizes(prev=>prev.includes("XL")? prev.filter(item=>item!== "XL") : [...prev,"XL"])}>
              <p className={` ${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XL</p>
            </div>
            <div onClick={()=>setSizes(prev=>prev.includes("XXL")? prev.filter(item=>item!== "XXL") : [...prev,"XXL"])}>
              <p className={` ${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XXL</p>
            </div>
          </div>

          {/* Size Chart Images */}
          <div className='mt-8'>
            <p className='mb-2'>Upload Size Chart Image</p>
            <div className='flex gap-2'>
              <label htmlFor='sizeimage1'>
                <img className='w-20'  src={!sizeimage1 ? assets.upload_area : URL.createObjectURL(sizeimage1)} />
                <input type='file' id='sizeimage1' hidden onChange={(e)=>setSizeimage1(e.target.files[0])}/>
              </label>
              <label htmlFor='sizeimage2'>
                <img className='w-20' src={!sizeimage2 ? assets.upload_area : URL.createObjectURL(sizeimage2)} />
                <input type='file' id='sizeimage2' hidden onChange={(e)=>setSizeimage2(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        {/* Merchandising */}
        <div className='flex flex-col gap-2 mt-2'>
          <div className='flex gap-2'>
            <input onChange={()=>setBestseller(prev=>!prev)} checked={bestseller} type='checkbox' id='bestseller' />
            <label className='cursor-pointer' htmlFor='bestseller'>Add to bestseller</label>
          </div>
          <div className='flex gap-2'>
            <input onChange={()=>setFeatured(prev=>!prev)} checked={featured} type='checkbox' id='featured' />
            <label className='cursor-pointer' htmlFor='featured'>Feature on homepage</label>
          </div>
          <input
            type="text"
            value={tags}
            onChange={(e)=>setTags(e.target.value)}
            placeholder="Tags: leather, biker, black"
            className="border px-3 py-2 rounded w-full max-w-md"
          />
        </div>

        {/* Submit */}
        <button type='submit' className='w-28 py-2 mt-4 bg-tz-navy hover:bg-tz-pink text-white rounded-lg'>SAVE</button>
      </form>
    </div>
  )
}

export default Edit
