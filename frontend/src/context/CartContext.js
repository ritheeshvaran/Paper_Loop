import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { asArray } from "@/lib/lists";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, discount_total: 0, total: 0, delivery: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flyFrom, setFlyFrom] = useState(null); // { x, y, img } for fly-to-cart animation

  const refresh = useCallback(async () => {
    if (!user) { setCart({ items: [], subtotal: 0, discount_total: 0, total: 0, delivery: 0 }); return; }
    try {
      const [c, w] = await Promise.all([api.get("/cart"), api.get("/wishlist")]);
      setCart(c.data);
      setWishlist(asArray(w.data));
    } catch (e) { /* ignore */ }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = async (product, qty = 1, origin = null) => {
    if (!user) {
      toast("Sign in to save items to your bag", { description: "Guests can browse, checkout needs a quick sign-in.", action: { label: "Sign in", onClick: () => (window.location.href = "/login") } });
      return;
    }
    try {
      const { data } = await api.post("/cart", { product_id: product.id, quantity: qty });
      setCart(data);
      if (origin) setFlyFrom({ ...origin, img: (product.images || [])[0], key: Date.now() });
      toast.success(`${product.name} added to bag`);
      setTimeout(() => setDrawerOpen(true), 500);
    } catch (e) {
      toast.error("Couldn't add to bag");
    }
  };

  const updateQty = async (product_id, quantity) => {
    const { data } = await api.put(`/cart/${product_id}`, { product_id, quantity });
    setCart(data);
  };

  const removeItem = async (product_id) => {
    const { data } = await api.delete(`/cart/${product_id}`);
    setCart(data);
  };

  const toggleWishlist = async (product) => {
    if (!user) { toast("Sign in to save favorites"); return; }
    const { data } = await api.post(`/wishlist/${product.id}`);
    if (data.wishlisted) toast.success(`Saved "${product.name}"`);
    else toast(`Removed "${product.name}" from wishlist`);
    refresh();
  };

  const isWishlisted = (pid) => wishlist.some((p) => p.id === pid);

  return (
    <CartContext.Provider value={{
      cart, wishlist, drawerOpen, setDrawerOpen, flyFrom, setFlyFrom,
      addToCart, updateQty, removeItem, refresh, toggleWishlist, isWishlisted,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
