import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [holdBills, setHoldBills] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(18); // Default 18% GST

  // Persist hold bills to local storage
  useEffect(() => {
    const savedBills = localStorage.getItem('erp_hold_bills');
    if (savedBills) {
      setHoldBills(JSON.parse(savedBills));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('erp_hold_bills', JSON.stringify(holdBills));
  }, [holdBills]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const holdCurrentBill = (referenceName) => {
    if (cart.length === 0) return;
    const newBill = {
      id: Date.now().toString(),
      reference: referenceName || `Bill #${holdBills.length + 1}`,
      cart: [...cart],
      discount,
      timestamp: new Date().toISOString()
    };
    setHoldBills([...holdBills, newBill]);
    clearCart();
  };

  const resumeBill = (billId) => {
    const billToResume = holdBills.find(b => b.id === billId);
    if (!billToResume) return;
    setCart(billToResume.cart);
    setDiscount(billToResume.discount || 0);
    setHoldBills(holdBills.filter(b => b.id !== billId));
  };

  const removeHoldBill = (billId) => {
    setHoldBills(holdBills.filter(b => b.id !== billId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.retailPrice) * item.quantity), 0);
  const totalAfterDiscount = Math.max(0, subtotal - discount);
  const gstAmount = (totalAfterDiscount * gstRate) / 100;
  const grandTotal = totalAfterDiscount + gstAmount;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      discount,
      setDiscount,
      gstRate,
      setGstRate,
      subtotal,
      gstAmount,
      grandTotal,
      holdBills,
      holdCurrentBill,
      resumeBill,
      removeHoldBill
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
