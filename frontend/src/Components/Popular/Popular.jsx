import React, { useEffect, useState } from 'react'
import './Popular.css'
import data_product from '../Assets/data'
import { Items } from '../Items/Items'

export const Popular = () => {

  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(()=>{
    fetch('https://e-commerce-website-backend-f3b5.onrender.com/popularinwomen')
   .then((response)=>response.json())
   .then((data)=>setPopularProducts(data))
  },[])
  
  return (
    <div className='popular'>
        <h1>Popular in WOMEN</h1>
        <hr/>
        <div className="popular-item">
            {popularProducts.map((item , i) => {
                return <Items key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}
