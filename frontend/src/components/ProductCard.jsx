import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { resolveMedia } from "@/lib/media";

export const ProductCard = ({ product, index = 0 }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ ry: (x - 0.5) * 8, rx: (0.5 - y) * 8 });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0 });

  const primary = resolveMedia(product.images?.[0]);
  const lifestyle = resolveMedia(product.lifestyle_image || product.images?.[1] || product.images?.[0]);
  const wished = isWishlisted(product.id);
  const outOfStock = (product.stock_quantity ?? 0) <= 0;
  const lowStock = !outOfStock && (product.stock_quantity ?? 0) < 5;

  const badges = [];
  if (product.is_limited) badges.push({ label: "Limited", cls: "bg-[color:var(--pl-orange)] text-white" });
  else if (product.is_best_seller) badges.push({ label: "Best Seller", cls: "bg-black text-white" });
  else if (product.is_trending) badges.push({ label: "Trending", cls: "bg-black text-white" });
  else if (product.is_new) badges.push({ label: "New", cls: "bg-white text-black border border-black" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="pl-tilt-wrap"
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
        className="group relative transition-transform duration-200"
        data-testid={`product-card-${product.slug}`}
      >
        <Link
          to={`/product/${product.slug}`}
          className="block relative aspect-[3/4] overflow-hidden bg-neutral-100"
          data-cursor="View"
        >
          {/* Primary image */}
          <img
            src={primary}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
          />
          {/* Lifestyle image */}
          <img
            src={lifestyle}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {badges.map((b) => (
              <span key={b.label} className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold ${b.cls}`}>{b.label}</span>
            ))}
            {product.discount_percent > 0 && (
              <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-[color:var(--pl-orange)] text-white">
                −{Math.round(product.discount_percent)}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            data-testid={`wishlist-btn-${product.slug}`}
            aria-label="Wishlist"
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${wished ? "fill-[color:var(--pl-orange)] text-[color:var(--pl-orange)]" : "text-black"}`} />
          </button>

          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="font-display uppercase tracking-widest text-black text-sm">Out of Stock</span>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="pt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">{product.category_slug}</div>
            <Link to={`/product/${product.slug}`} className="block mt-1 font-display font-semibold text-base leading-tight uppercase tracking-tight truncate">
              {product.name}
            </Link>
            <div className="mt-1 flex items-baseline gap-2 font-tabular">
              <span className="font-bold">{formatINR(product.final_price)}</span>
              {product.has_discount && <span className="text-xs text-neutral-400 line-through">{formatINR(product.price)}</span>}
            </div>
            {lowStock && <div className="mt-1 text-[10px] uppercase tracking-widest text-amber-700 font-bold">Only {product.stock_quantity} left</div>}
          </div>

          <button
            data-testid={`add-to-cart-${product.slug}`}
            aria-label="Add to bag"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              addToCart(product, 1, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
            disabled={outOfStock}
            className="shrink-0 w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-[color:var(--pl-orange)] transition-colors disabled:bg-neutral-300"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
