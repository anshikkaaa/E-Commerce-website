import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import new_collection from '../Assets/new_collections'
import { Items } from '../Items/Items'

export const NewCollections = () => {

  const [new_collection, setnew_collection] = useState([]);

  useEffect(()=>{
    fetch('https://e-commerce-website-backend-f3b5.onrender.com/newcollections')
    .then((response)=>response.json())
  .then((data)=>setnew_collection(data))
},[])
  return (
    <div className='NewCollections'>
        <h1>NEW COLLECTIONS</h1>
        <hr/>

        <div className="collections">
            {new_collection.map((item ,i) => {
                return <Items key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}
