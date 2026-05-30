import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('apex_wheels_wishlist');
    const savedCart = localStorage.getItem('apex_wheels_cart');
    
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('apex_wheels_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('apex_wheels_cart', JSON.stringify(cart));
  }, [cart]);

  // Wishlist Actions
  const addToWishlist = (car) => {
    if (!wishlist.some(item => item.id === car.id)) {
      setWishlist([...wishlist, car]);
    }
  };

  const removeFromWishlist = (carId) => {
    setWishlist(wishlist.filter(item => item.id !== carId));
  };

  const isInWishlist = (carId) => {
    return wishlist.some(item => item.id === carId);
  };

  // Cart Actions
  const addToCart = (car) => {
    if (!cart.some(item => item.id === car.id)) {
      setCart([...cart, car]);
    }
  };

  const removeFromCart = (carId) => {
    setCart(cart.filter(item => item.id !== carId));
  };

  const isInCart = (carId) => {
    return cart.some(item => item.id === carId);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      cart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      addToCart,
      removeFromCart,
      isInCart,
      clearCart
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
