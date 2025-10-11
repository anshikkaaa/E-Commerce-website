import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

export const AddProduct = () => {
    const [image, setImage] = useState(false);
    const [productDetails , setProductDetails] = useState({
        name:"",
        image:"",
        category:"women",
        new_price:"",
        old_price:""
    })

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
    
    // Debug: Log the backend URL
    console.log('Environment VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
    console.log('Final backendUrl:', backendUrl);

    const imageHandler = (e)=>{
        setImage(e.target.files[0])
    }

    const changeHander = (e) => {
        setProductDetails({...productDetails,[e.target.name]:e.target.value})
    }

    const Add_Product = async() => {
        console.log('Add Product clicked');
        console.log('Product Details:', productDetails);
        console.log('Backend URL:', backendUrl);
        console.log('Image:', image);

        // Validation
        if (!productDetails.name) {
            alert('Please enter product name');
            return;
        }
        if (!productDetails.new_price || !productDetails.old_price) {
            alert('Please enter both old and new prices');
            return;
        }
        if (!image) {
            alert('Please select an image');
            return;
        }

        try {
            let responseData;
            let product = productDetails;

            let formData = new FormData()
            formData.append('product' , image);

            console.log('Uploading image to:', `${backendUrl}/upload`);
            
            const uploadResponse = await fetch(`${backendUrl}/upload`, {
                method:'POST',
                headers:{
                    Accept:'application/json'
                },
                body:formData,
            });
            
            console.log('Upload response status:', uploadResponse.status);
            responseData = await uploadResponse.json();
            console.log('Upload response data:', responseData);

            if(responseData.success){
                product.image = responseData.image_url;
                console.log('Product with image URL:', product);
                
                const addProductResponse = await fetch(`${backendUrl}/addproduct`, {
                    method:'POST',
                    headers:{
                        Accept:'application/json',
                        'Content-Type':'application/json',
                    },
                    body:JSON.stringify(product),
                });
                
                console.log('Add product response status:', addProductResponse.status);
                const addProductData = await addProductResponse.json();
                console.log('Add product response data:', addProductData);
                
                if(addProductData.success) {
                    alert("Product added successfully!");
                    // Reset form
                    setProductDetails({
                        name:"",
                        image:"",
                        category:"women",
                        new_price:"",
                        old_price:""
                    });
                    setImage(false);
                } else {
                    alert("Failed to add product");
                }
            } else {
                alert("Image upload failed: " + (responseData.message || "Unknown error"));
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert("Error adding product: " + error.message);
        }
    }

  return (
    <div className='add-product'>
        <div className="addproduct-itemfield">
            <p>Product Title</p>
            <input value={productDetails.name} onChange={changeHander} type="text" name='name' placeholder='your name' />
        </div>
        <div className="addproduct-price">
            <div className="addproduct-itemfield">
                <p>Price</p>
                <input value={productDetails.old_price} onChange={changeHander} type="text" name='old_price' placeholder='type here' />
            </div>
            <div className="addproduct-itemfield">
                <p>Offer Price</p>
                <input value={productDetails.new_price} onChange={changeHander} type="text" name='new_price' placeholder='type here' />
            </div>
        </div>
        <div className="addproduct-itemfield">
            <p>Product Category</p>
            <select value={productDetails.category} onChange={changeHander} name="category" className='add-product-selector'>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kid">Kid</option>
            </select>
        </div>
        <div className="addproduct-itemfield">
            <label htmlFor="file-input">
                <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumbnail-img' alt="" />
            </label>
            <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
        </div>
        <button onClick={()=>{Add_Product()}} className='addproduct-btn'>ADD</button>

    </div>
  )
}
