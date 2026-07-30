import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/wishlist").then((r) => { setItems(r.data); setLoading(false); }); }, []);

  return (
    <div className="pl-section-light py-16">
      <div className="pl-container">
        <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2">Saved for later</div>
        <h1 className="font-display uppercase text-editorial mb-10">Your Wishlist</h1>
        {loading ? <p className="text-neutral-500">Loading…</p> :
          items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-neutral-500">Nothing saved yet. <Link to="/collections" className="underline">Browse the drops</Link>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
      </div>
    </div>
  );
};
export default Wishlist;
