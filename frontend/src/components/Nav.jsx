import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

const links = [
  { to: "/collections", label: "Shop" },
  { to: "/collections/anime", label: "Anime" },
  { to: "/collections/cars", label: "Cars" },
  { to: "/collections/keychains", label: "Keychains" },
  { to: "/coming-soon", label: "Coming Soon" },
  { to: "/about", label: "About" },
];

export const Nav = ({ settings }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const { cart, setDrawerOpen } = useCart();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [loc.pathname]);

  return (
    <>
      {/* Announcement bar */}
      {settings?.announcement && (
        <div data-testid="announcement-bar" className="bg-[color:var(--pl-black)] text-white text-center text-[11px] tracking-widest uppercase py-2 font-medium">
          {settings.announcement}
        </div>
      )}

      <motion.header
        data-testid="site-nav"
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(10,10,10,0.72)" : "rgba(10,10,10,0.35)",
          borderBottomColor: scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0)",
        }}
        transition={{ duration: 0.25 }}
        className="sticky top-0 z-50 pl-glass-dark border-b text-white"
      >
        <div className="pl-container flex items-center justify-between h-16 md:h-20">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 shrink-0">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Paper & Loop" className="h-8 md:h-10 w-auto" />
            ) : (
              <span className="font-display text-lg tracking-tight">Paper &amp; Loop</span>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={({ isActive }) =>
                  `text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors ${isActive ? "text-[color:var(--pl-orange)]" : "text-white/80 hover:text-white"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button data-testid="nav-search-btn" aria-label="Search" onClick={() => setSearchOpen(true)} className="p-2 hover:text-[color:var(--pl-orange)] transition-colors" data-cursor="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link to={user ? "/account" : "/login"} data-testid="nav-account-btn" aria-label="Account" className="p-2 hover:text-[color:var(--pl-orange)] transition-colors" data-cursor={user ? "Account" : "Sign in"}>
              <User className="w-5 h-5" />
            </Link>
            <Link to="/account/wishlist" data-testid="nav-wishlist-btn" aria-label="Wishlist" className="p-2 hover:text-[color:var(--pl-orange)] transition-colors hidden md:inline-flex">
              <Heart className="w-5 h-5" />
            </Link>
            <button
              data-testid="nav-cart-btn"
              aria-label="Cart"
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 hover:text-[color:var(--pl-orange)] transition-colors"
              data-cursor="Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.items?.length > 0 && (
                <span data-testid="cart-count" className="absolute -top-0.5 -right-0.5 bg-[color:var(--pl-orange)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.items.reduce((a, i) => a + i.quantity, 0)}
                </span>
              )}
            </button>
            <button data-testid="nav-mobile-toggle" aria-label="Menu" onClick={() => setMobileOpen(true)} className="p-2 lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[color:var(--pl-black)] text-white flex flex-col"
          >
            <div className="pl-container flex items-center justify-between h-16">
              <span className="font-display uppercase tracking-tight">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close" className="p-2"><X /></button>
            </div>
            <nav className="pl-container flex-1 flex flex-col gap-6 justify-center">
              {links.map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.05 * i } }}>
                  <Link to={l.to} className="font-display text-4xl md:text-5xl uppercase tracking-tight hover:text-[color:var(--pl-orange)]">{l.label}</Link>
                </motion.div>
              ))}
              <div className="mt-6 flex gap-3">
                <Link to={user ? "/account" : "/login"} className="pl-btn pl-btn-primary">{user ? "Account" : "Sign in"}</Link>
                <Link to="/account/wishlist" className="pl-btn pl-btn-ghost-dark">Wishlist</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

const SearchOverlay = ({ open, onClose }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (!q) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?q=${encodeURIComponent(q)}&limit=8`);
        setResults(data);
      } catch (e) { setResults([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] pl-glass-dark" onClick={onClose}>
          <motion.div
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="pl-container pt-8 md:pt-16" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/20 pb-4">
              <Search className="w-5 h-5 text-white/60" />
              <input
                data-testid="search-input"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search posters, keychains, categories…"
                className="flex-1 bg-transparent text-white placeholder-white/40 font-display text-2xl md:text-4xl focus:outline-none"
              />
              <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white p-2"><X /></button>
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {results.map((p) => (
                <a key={p.id} href={`/product/${p.slug}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-neutral-900">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="mt-2 text-white text-sm font-medium">{p.name}</div>
                  <div className="text-white/60 text-xs uppercase tracking-wider">{p.category_slug}</div>
                </a>
              ))}
              {q && results.length === 0 && (
                <div className="col-span-full text-white/60 text-center py-16 font-display uppercase tracking-widest">Nothing matched. Try another word.</div>
              )}
              {!q && (
                <div className="col-span-full text-white/40 text-sm uppercase tracking-widest">Popular · Anime · Cars · Gaming · Keychains</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
