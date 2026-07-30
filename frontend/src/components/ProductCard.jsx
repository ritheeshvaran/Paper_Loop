import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { resolveMedia } from "@/lib/media";

export const ProductCard = ({ product, index = 0, dark = false }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hover, setHover] = useState(false);
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ ry: (x - 0.5) * 5, rx: (0.5 - y) * 5 });
  };
  const onLeave = () => { setTilt({ rx: 0, ry: 0 }); setHover(false); };

  const primary = resolveMedia(product.images?.[0]);
  const lifestyle = resolveMedia(product.lifestyle_image || product.images?.[1] || product.images?.[0]);
  const wished = isWishlisted(product.id);
  const outOfStock = (product.stock_quantity ?? 0) <= 0;
  const lowStock = !outOfStock && (product.stock_quantity ?? 0) < 5;

  const badges = [];
  if (product.is_limited) badges.push({ label: "Limited", cls: "bg-[color:var(--pl-orange)] text-white" });
  else if (product.is_best_seller) badges.push({ label: "Best Seller", cls: "bg-white text-black" });
  else if (product.is_trending) badges.push({ label: "Trending", cls: "bg-white text-black" });
  else if (product.is_new) badges.push({ label: "New", cls: "bg-black text-white border border-white/10" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="pl-tilt-wrap"
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={onLeave}
        style={{ transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
        className="group relative transition-transform duration-200 will-change-transform"
        data-testid={`product-card-${product.slug}`}
      >
        <Link
          to={`/product/${product.slug}`}
          className={`block relative aspect-[4/5] overflow-hidden ${dark ? "bg-neutral-900" : "bg-neutral-100"}`}
          data-cursor="View"
        >
          {/* Primary */}
          <motion.img
            src={primary}
            alt={product.name}
            loading="lazy"
            initial={false}
            animate={{ scale: hover ? 1.08 : 1, opacity: hover ? 0 : 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Lifestyle */}
          <motion.img
            src={lifestyle}
            alt=""
            aria-hidden
            loading="lazy"
            initial={false}
            animate={{ scale: hover ? 1.03 : 1.1, opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay for legibility */}
          <div className={`absolute inset-x-0 bottom-0 h-24 ${dark ? "bg-gradient-to-t from-black/60 to-transparent" : "bg-gradient-to-t from-white/70 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {badges.map((b) => (
              <span key={b.label} className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-bold ${b.cls}`}>{b.label}</span>
            ))}
            {product.discount_percent > 0 && (
              <span className="px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-bold bg-[color:var(--pl-orange)] text-white">
                −{Math.round(product.discount_percent)}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            data-testid={`wishlist-btn-${product.slug}`}
            aria-label="Wishlist"
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            data-cursor="Save"
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 transition-colors ${wished ? "fill-[color:var(--pl-orange)] text-[color:var(--pl-orange)]" : "text-black"}`} />
          </button>

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <span className="font-display uppercase tracking-widest text-black text-sm">Out of Stock</span>
            </div>
          )}

          {/* Quick Add — slides up on hover */}
          {!outOfStock && (
            <AnimatePresence>
              {hover && (
                <motion.button
                  data-testid={`add-to-cart-${product.slug}`}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => {
                    e.preventDefault();
                    const r = e.currentTarget.getBoundingClientRect();
                    addToCart(product, 1, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
                  }}
                  data-cursor="Add"
                  className="absolute inset-x-3 bottom-3 z-10 h-11 bg-black text-white hover:bg-[color:var(--pl-orange)] flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" /> Quick Add
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </Link>

        {/* Info */}
        <div className="pt-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className={`text-[10px] uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-neutral-500"}`}>{product.category_slug}</div>
            <Link to={`/product/${product.slug}`} className={`block mt-1 font-display font-semibold text-base leading-tight uppercase tracking-tight truncate ${dark ? "text-white" : ""}`}>
              {product.name}
            </Link>
            {product.description && (
              <p className={`mt-1 text-xs line-clamp-1 ${dark ? "text-white/50" : "text-neutral-500"}`}>{product.description}</p>
            )}
            <div className="mt-2 flex items-baseline gap-2 font-tabular">
              <span className={`font-bold ${dark ? "text-white" : ""}`}>{formatINR(product.final_price)}</span>
              {product.has_discount && <span className={`text-xs line-through ${dark ? "text-white/40" : "text-neutral-400"}`}>{formatINR(product.price)}</span>}
            </div>
            {lowStock && <div className="mt-1 text-[10px] uppercase tracking-widest text-amber-500 font-bold">Only {product.stock_quantity} left</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
