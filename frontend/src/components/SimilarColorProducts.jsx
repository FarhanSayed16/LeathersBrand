import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import SimilarColorProductItem from './SimilarColorProductItem';

const SimilarColorProducts = ({secondaryName}) => {

  const {products}=useContext(ShopContext);
  const [related,setRelated]=useState([]);

  useEffect(()=>{
    if(products.length>0){
        let productsCopy=products.slice();
        productsCopy=productsCopy.filter((item)=>secondaryName===item.secondaryName)
        setRelated(productsCopy.slice(0,20))
    }
  },[products,secondaryName])

  return (
    <div className=''>
        <div className=' grid grid-cols-6 gap-2'>
            {
              related.map((item,index)=>(
                <SimilarColorProductItem key={index} id={item._id} image={item.image} />
              ))
            }
        </div>
    </div>
  )
}

export default SimilarColorProducts