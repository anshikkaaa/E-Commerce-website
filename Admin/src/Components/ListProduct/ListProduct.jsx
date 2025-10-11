import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

export const ListProduct = () => {
  const [allproducts , setAllProducts] = useState([]);
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  const fetchInfo = async()=>{
    await fetch(`${backendUrl}/allproducts`)
    .then((res)=>res.json())
    .then((data)=>{setAllProducts(data)})
  }

  useEffect(()=>{
    fetchInfo();
  },[])

  const remove_product = async(id)=>{
    await fetch (`${backendUrl}/removeproduct`, {
      method:'POST',
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json',
      },
      body:JSON.stringify({id:id})
    })
    await fetchInfo();
  }

  return (
    <div className='list-product'>
        <h1>All Products List</h1>
        <div className="listproduct-format-main">
          <p className='product'>Products</p>
          <p className='title'>Title</p>
          <p className='old-price'>Old Price</p>
          <p className='new-price'>New Price</p>
          <p className='category'>Category</p>
          <p className='remove'>Remove</p>
        </div>
        <div className="listproduct-allproducts">
          <hr />
          {allproducts.map((product)=>{
            return <div key={product.id}>
                <div className="listproduct-format-main listproduct-format">
                    <img src={product.image} alt="" />
                    <p>{product.name}</p>
                    <p>${product.old_price}</p>
                    <p>${product.new_price}</p>
                    <p>{product.category}</p>
                    <img onClick={() => { remove_product(product.id) }} className='listproduct-remove-icon' src={cross_icon} alt="" />
                </div>
                <hr />
            </div>
          })}
        </div>
    </div>
  )
}
