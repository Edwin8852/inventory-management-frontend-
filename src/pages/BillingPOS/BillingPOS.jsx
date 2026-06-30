import React from 'react';
import { useCart } from '../../hooks/useCart';

const BillingPOS = () => {
  const { cart, addItem, clearCart } = useCart();

  return (
    <div className="flex h-full gap-6">
      {/* Product Selection Area */}
      <div className="flex-[2] bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-4">Select Products</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Mock Product */}
          <div 
            className="border p-4 rounded cursor-pointer hover:border-blue-500"
            onClick={() => addItem({ id: 1, name: 'Cotton T-Shirt (M)', price: 499 })}
          >
            <h3 className="font-semibold">Cotton T-Shirt</h3>
            <p className="text-gray-600">Size: M | ₹499</p>
          </div>
        </div>
      </div>

      {/* Cart/Billing Area */}
      <div className="flex-1 bg-white rounded shadow p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Current Order</h2>
        <div className="flex-1 overflow-auto border-b mb-4">
          {cart.items.length === 0 ? (
            <p className="text-gray-400">Cart is empty</p>
          ) : (
            <ul className="space-y-2">
              {cart.items.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>₹{item.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <button 
            onClick={clearCart}
            className="w-full bg-red-500 text-white py-2 rounded mb-2 hover:bg-red-600"
          >
            Clear Cart
          </button>
          <button className="w-full bg-green-500 text-white py-3 rounded font-bold hover:bg-green-600">
            Generate Invoice (Checkout)
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingPOS;
