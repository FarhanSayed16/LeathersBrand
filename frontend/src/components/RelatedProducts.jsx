import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category,subCategory,color}) => {

  const {products}=useContext(ShopContext);
  const [related,setRelated]=useState([]);

  useEffect(()=>{
    if(products.length>0){
        let productsCopy=products.slice();
        productsCopy=productsCopy.filter((item)=>category===item.category);
        productsCopy=productsCopy.filter((item)=>subCategory===item.subCategory);
        // productsCopy=productsCopy.filter((item)=>color===item.color);
        setRelated(productsCopy.slice(0,20))
    }
  },[products, category, subCategory])

  return (
    <div className=' mt-7 mb-12'>
        <div className=' text-2xl md:text-3xl py-2 px-4'>
          <Title text1={"SIMILAR"} text2={"PRODUCTS"}/>
        </div>

        <div className=' grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1'>
            {
              related.map((item) => (
                <ProductItem key={item._id} id={item._id} image={item.image} name={item.name} price={item.price} discount={item.discount} oldPrice={item.oldPrice}/>
              ))
            }
        </div>
    </div>
  )
}

export default RelatedProducts