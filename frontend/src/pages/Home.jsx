import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Instagram } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { FadeUp } from "@/components/Reveal";

const HeroCarousel = ({ images = [] }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 5500);
    return () => clearInterval(t);
  }, [images.length]);
  if (!images.length) return null;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={idx}
          src={images[idx]}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
    </div>
  );
};

const Home = ({ settings }) => {
  const [best, setBest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [mouse, setMouse] = useState({ x: -100, y: -100 });

  useEffect(() => {
    api.get("/products?best_seller=true&limit=8").then((r) => setBest(r.data));
    api.get("/products?trending=true&limit=8").then((r) => setTrending(r.data));
    api.get("/products?featured=true&limit=4").then((r) => setFeatured(r.data));
  }, []);

  const heroImages = settings?.hero_images || [];

  return (
    <div>
      {/* HERO */}
      <section
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        className="relative min-h-[100vh] flex flex-col justify-end text-white overflow-hidden"
      >
        <HeroCarousel images={heroImages} />
        {/* Mouse-follow glow */}
        <motion.div
          animate={{ x: mouse.x - 200, y: mouse.y - 200 }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
          className="hidden lg:block absolute w-[400px] h-[400px] rounded-full pointer-events-none z-[1]"
          style={{ background: "radial-gradient(circle, rgba(255,106,0,0.35), transparent 70%)" }}
        />

        <div className="pl-container relative z-10 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[11px] tracking-[0.25em] uppercase text-[color:var(--pl-orange)] mb-6"
          >
            ● New Drop Live
          </motion.div>

          <h1 data-testid="hero-title" className="font-display uppercase text-hero max-w-5xl">
            {["Posters.", "Keychains.", "Your Style."].map((word, i) => (
              <span key={word} className="pl-mask block">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.0, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "inline-block" }}
                  className={i === 2 ? "text-[color:var(--pl-orange)]" : ""}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.7 }}
            className="mt-6 text-white/80 max-w-md text-base leading-relaxed"
          >
            Editorial wall art and pocket flex for the ones who curate their space with intent.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/collections" data-testid="hero-shop-btn" className="pl-btn pl-btn-primary">Shop Posters <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/collections/keychains" className="pl-btn pl-btn-ghost-dark">Explore Keychains</Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-6 right-6 md:right-12 z-10 hidden md:flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="w-px h-8 bg-white/60" />
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="bg-[color:var(--pl-orange)] text-white overflow-hidden">
        <div className="pl-marquee-track py-4">
          {Array(2).fill(0).map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0 px-6">
              {["Free shipping across India", "Museum-grade matte print", "Limited then gone", "New drops weekly", "Real editorial. No stock energy.", "Premium keychains"].map((t) => (
                <span key={t} className="font-display uppercase tracking-widest text-sm whitespace-nowrap">◆ {t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <section className="pl-section-light py-24 md:py-32">
        <div className="pl-container">
          <div className="flex items-end justify-between mb-12">
            <FadeUp>
              <div className="text-[11px] tracking-[0.25em] uppercase text-neutral-500 mb-4">01 · The Collections</div>
              <h2 className="font-display text-editorial uppercase">Choose your <br /><span className="text-[color:var(--pl-orange)]">obsession.</span></h2>
            </FadeUp>
            <Link to="/collections" className="hidden md:inline-flex pl-btn pl-btn-ghost-light">All Collections <ArrowUpRight className="w-4 h-4" /></Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { name: "Anime", slug: "anime", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200" },
              { name: "Cars", slug: "cars", img: "https://images.unsplash.com/photo-1604705528621-81b2755a320b?w=1200" },
              { name: "Gaming", slug: "gaming", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200" },
              { name: "Keychains", slug: "keychains", img: "https://images.unsplash.com/photo-1607081692251-b8b7fdd4f6ff?w=1200" },
            ].map((c, i) => (
              <FadeUp key={c.slug} delay={i * 0.08}>
                <Link to={`/collections/${c.slug}`} data-testid={`collection-tile-${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-black" data-cursor="Enter">
                  <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <div className="text-[10px] uppercase tracking-widest text-white/60">Collection · 0{i + 1}</div>
                    <div className="font-display text-3xl md:text-4xl uppercase leading-none mt-1 flex items-center gap-2">
                      {c.name}
                      <ArrowUpRight className="w-6 h-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="pl-section-dark py-24 md:py-32">
        <div className="pl-container">
          <div className="flex items-end justify-between mb-12">
            <FadeUp>
              <div className="text-[11px] tracking-[0.25em] uppercase text-white/50 mb-4">02 · Best Sellers</div>
              <h2 className="font-display text-editorial uppercase text-white">The ones <br />that flew off <span className="text-[color:var(--pl-orange)]">the shelf.</span></h2>
            </FadeUp>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {best.slice(0, 4).map((p, i) => (
              <div key={p.id} className="text-white">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="pl-section-light py-24 md:py-32">
        <div className="pl-container">
          <FadeUp>
            <div className="text-[11px] tracking-[0.25em] uppercase text-neutral-500 mb-4">03 · Trending Now</div>
            <h2 className="font-display text-editorial uppercase mb-12">On everyone's wall <span className="text-[color:var(--pl-orange)]">this week.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* COMING SOON teaser */}
      <section className="pl-section-dark py-24 md:py-32 relative overflow-hidden">
        <div className="pl-container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="text-[11px] tracking-[0.25em] uppercase text-[color:var(--pl-orange)] mb-4">Dropping Season 2026</div>
              <h2 className="font-display text-editorial uppercase text-white">Wear <br />the <span className="text-[color:var(--pl-orange)]">brand.</span></h2>
              <p className="mt-6 text-white/70 max-w-md">Oversized tees. Heavy hoodies. Accessories that do the loud talking. First to know gets first dibs.</p>
              <Link to="/coming-soon" className="pl-btn pl-btn-primary mt-8">Get Notified <ArrowRight className="w-4 h-4" /></Link>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1523585298601-d46ae038d7d3?w=800" alt="T-shirt" className="aspect-[3/4] object-cover" />
                <img src="https://images.unsplash.com/photo-1586670926282-e5fc05bf15c3?w=800" alt="Hoodie" className="aspect-[3/4] object-cover mt-8" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="pl-section-light py-24 md:py-32">
        <div className="pl-container">
          <FadeUp>
            <div className="text-[11px] tracking-[0.25em] uppercase text-neutral-500 mb-4">04 · Why Paper &amp; Loop</div>
            <h2 className="font-display text-editorial uppercase mb-12">We built this <br />for <span className="text-[color:var(--pl-orange)]">the wall.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: "01", t: "Museum-Grade Print", d: "250gsm matte, archival ink. Won't yellow, won't crack." },
              { n: "02", t: "Zero Delivery Charge", d: "Free across India. Priced in, not bolted on." },
              { n: "03", t: "Secure UPI Payment", d: "Scan, pay, track. No card details ever stored." },
              { n: "04", t: "Fast Dispatch", d: "In your hands in 3–5 days. No delayed drop lies." },
            ].map((f, i) => (
              <FadeUp key={f.n} delay={i * 0.08}>
                <div className="border-t border-black pt-6">
                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-4">{f.n}</div>
                  <div className="font-display uppercase text-lg mb-2">{f.t}</div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{f.d}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="pl-section-dark py-24 md:py-32">
        <div className="pl-container text-center">
          <FadeUp>
            <div className="text-[11px] tracking-[0.25em] uppercase text-[color:var(--pl-orange)] mb-4">Drop Alerts</div>
            <h2 className="font-display text-editorial uppercase text-white max-w-3xl mx-auto">First to <br />know, <span className="text-[color:var(--pl-orange)]">first to own.</span></h2>
            <form onSubmit={(e) => { e.preventDefault(); e.target.reset(); }} className="mt-10 max-w-md mx-auto flex border-b border-white/30 pb-3">
              <input required type="email" placeholder="your@email.com" className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none px-2" data-testid="newsletter-email" />
              <button className="text-white uppercase tracking-widest text-xs font-bold hover:text-[color:var(--pl-orange)]">Subscribe →</button>
            </form>
            <p className="mt-3 text-white/40 text-xs uppercase tracking-widest">No spam. Only drops.</p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
};

export default Home;
