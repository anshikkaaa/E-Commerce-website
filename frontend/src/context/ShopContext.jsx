import React, { createContext, useEffect, useState } from 'react';

export const ShopContext = createContext(null);
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

// Debug logging
console.log('Frontend Environment REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
console.log('Frontend Final backendUrl:', backendUrl);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index <= 300; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => {
        console.log('Fetching products from:', `${backendUrl}/allproducts`);
        fetch(`${backendUrl}/allproducts`)
            .then((response) => {
                console.log('Products response status:', response.status);
                return response.json();
            })
            .then((data) => {
                console.log('Products loaded:', data);
                setAll_Product(data);
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });

        if (localStorage.getItem('auth-token')) {
            console.log('Fetching cart from:', `${backendUrl}/getcart`);
            fetch(`${backendUrl}/getcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({})
            })
            .then((response) => {
                console.log('Cart response status:', response.status);
                return response.json();
            })
            .then((data) => {
                console.log('Cart loaded:', data);
                setCartItems(data);
            })
            .catch((error) => {
                console.error('Error fetching cart:', error);
            });
        } else {
            console.log('No auth token found, using default cart');
        }
    }, []);

    const addtoCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

        if (localStorage.getItem('auth-token')) {
            fetch(`${backendUrl}/addtocart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ itemId })
            })
            .then((response) => response.json())
            .then((data) => console.log(data));
        }
    }

    const removefromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

        if (localStorage.getItem('auth-token')) {
            fetch(`${backendUrl}/removefromcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ itemId })
            })
            .then((response) => response.json())
            .then((data) => console.log(data));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo && itemInfo.new_price) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalItem += cartItems[item];
                }
            }
        }
        return totalItem;
    }

    return (
        <ShopContext.Provider value={{ all_product, cartItems, addtoCart, removefromCart, getTotalCartAmount, getTotalCartItems }}>
            {props.children}
        </ShopContext.Provider>
    );
}

export default ShopContextProvider;

