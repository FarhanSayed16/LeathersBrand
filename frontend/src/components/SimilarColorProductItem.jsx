


import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link, useParams } from "react-router-dom";

const SimilarColorProductItem = ({ id, image }) => {
  const {products,wishlistItems } =useContext(ShopContext)
  const {productId}=useParams();
  const [productData,setProductData]=useState(false)
  // const [isLiked, setIsLiked] = useState(false);
  const [isLiked, setIsLiked] = useState(wishlistItems.includes(id));

  const [imageForCart,setImageForCart]=useState('')
    const [size,setSize]=useState('')
  
    const fetchProductData=async()=>{
        products.map((item)=>{
            if(item._id===productId){
                setProductData(item)
                setImageForCart(item.image[0])
                return null;
            }
        })
    }
  
    useEffect(()=>{
      fetchProductData()
    },[productId,products])

    useEffect(() => {
      setIsLiked(wishlistItems.includes(id));
      
    }, [wishlistItems, id]);



  return (
    <div className=" bg-white shadow-md ">
     
      {/* Product Image */}
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
        <div className="overflow-hidden">
          <img
            src={image[0]}
            className="w-20 sm:w-14 md:w-12 xl:w-14 object-contain"
          />
        </div> 
      </Link>

    </div>
  );
};

export default SimilarColorProductItem;
