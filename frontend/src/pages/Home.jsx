import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { resolveMedia } from "@/lib/media";
import { ProductCard } from "@/components/ProductCard";
import { FadeUp } from "@/components/Reveal";
import { toast } from "sonner";

/* ── Floating particles background ─────────────────────────────────────── */
const Particles = ({ count = 40 }) => {
  const dots = React.useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 2.5 + 0.5,
      d: Math.random() * 10 + 12,
      delay: Math.random() * -20,
    })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-white/40"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s }}
          animate={{ y: [-10, -60, -10], opacity: [0, 0.7, 0] }}
          transition={{ duration: d.d, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

/* ── Cinematic hero ────────────────────────────────────────────────────── */
const Hero = () => {
  const wrapRef = useRef(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 200]);
  const parallaxOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const bgX = useTransform(smx, [-1, 1], [-20, 20]);
  const bgY = useTransform(smy, [-1, 1], [-15, 15]);
  const midX = useTransform(smx, [-1, 1], [-45, 45]);
  const midY = useTransform(smy, [-1, 1], [-30, 30]);
  const fgX = useTransform(smx, [-1, 1], [-80, 80]);
  const fgY = useTransform(smy, [-1, 1], [-50, 50]);

  const onMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  return (
    <section
      ref={wrapRef}
      onMouseMove={onMove}
      className="relative min-h-[100vh] overflow-hidden bg-[color:var(--pl-black)] text-white"
    >
      {/* Room ambient light — RGB gradients */}
      <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(120,60,255,0.32), transparent 45%)," +
            "radial-gradient(circle at 85% 30%, rgba(255,60,150,0.28), transparent 45%)," +
            "radial-gradient(circle at 50% 90%, rgba(255,106,0,0.32), transparent 55%)," +
            "radial-gradient(circle at 90% 90%, rgba(60,180,255,0.22), transparent 45%)",
        }} />
        <div className="absolute inset-0 bg-[color:var(--pl-black)]/40" />
      </motion.div>

      {/* Background: dark room texture */}
      <motion.div style={{ x: bgX, y: bgY, scale: 1.08 }} className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=2400&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
      </motion.div>

      {/* Mid layer: floating framed poster mockups */}
      <motion.div style={{ x: midX, y: midY }} className="absolute inset-0 pointer-events-none">
        {/* Left frame */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ delay: 1.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block absolute left-[3%] top-[18%] w-[19vw] max-w-[260px] aspect-[3/4] shadow-2xl"
          style={{ boxShadow: "0 40px 80px -20px rgba(255,60,150,0.4), 0 0 0 10px rgba(20,20,20,0.95), 0 0 0 11px rgba(255,255,255,0.08)" }}
        >
          <img src="https://images.unsplash.com/photo-1554797589-7241bb691973?w=800" alt="" className="w-full h-full object-cover" />
        </motion.div>
        {/* Right frame */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 5 }}
          transition={{ delay: 1.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block absolute right-[4%] top-[14%] w-[18vw] max-w-[240px] aspect-[3/4] shadow-2xl"
          style={{ boxShadow: "0 40px 80px -20px rgba(120,60,255,0.4), 0 0 0 10px rgba(20,20,20,0.95), 0 0 0 11px rgba(255,255,255,0.08)" }}
        >
          <img src="https://images.unsplash.com/photo-1600661653561-629509216228?w=800" alt="" className="w-full h-full object-cover" />
        </motion.div>
        {/* Bottom left */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 1.35, duration: 1.2 }}
          className="hidden lg:block absolute left-[8%] bottom-[8%] w-[12vw] max-w-[170px] aspect-[3/4] shadow-2xl"
          style={{ boxShadow: "0 30px 60px -15px rgba(255,106,0,0.4), 0 0 0 8px rgba(20,20,20,0.95)" }}
        >
          <img src="https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600" alt="" className="w-full h-full object-cover" />
        </motion.div>
        {/* Bottom right */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 6 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={{ delay: 1.5, duration: 1.2 }}
          className="hidden lg:block absolute right-[10%] bottom-[12%] w-[11vw] max-w-[150px] aspect-[3/4] shadow-2xl"
          style={{ boxShadow: "0 30px 60px -15px rgba(60,180,255,0.4), 0 0 0 8px rgba(20,20,20,0.95)" }}
        >
          <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600" alt="" className="w-full h-full object-cover" />
        </motion.div>
        {/* Acrylic keychain hint - small floating card */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -12 }}
          animate={{ opacity: 1, y: 0, rotate: -8 }}
          transition={{ delay: 1.7, duration: 1.2 }}
          className="hidden xl:block absolute right-[22%] bottom-[24%] w-[7vw] max-w-[80px] aspect-square rounded-lg overflow-hidden"
          style={{ boxShadow: "0 20px 40px -10px rgba(255,106,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.15)" }}
        >
          <img src="https://images.unsplash.com/photo-1607081692251-b8b7fdd4f6ff?w=400" alt="" className="w-full h-full object-cover" />
        </motion.div>
      </motion.div>

      {/* Particles */}
      <Particles count={40} />

      {/* Content foreground */}
      <motion.div style={{ x: fgX, y: fgY }} className="relative z-10 pl-container min-h-[100vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-[11px] tracking-[0.32em] uppercase text-[color:var(--pl-orange)] mb-6 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--pl-orange)] animate-pulse" />
          The Collector's Store
        </motion.div>

        <h1 data-testid="hero-title" className="font-display uppercase text-hero max-w-5xl">
          {["Collect", "what you", "love."].map((word, i) => (
            <span key={i} className="pl-mask block">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "inline-block" }}
                className={i === 2 ? "text-[color:var(--pl-orange)]" : ""}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.7 }}
          className="mt-6 text-white/70 max-w-xl text-base md:text-lg leading-relaxed"
        >
          Museum-grade posters and acrylic keychains for the ones who curate their wall, their desk, and their fandom with intent.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link to="/shop?type=posters" data-testid="hero-shop-btn" data-cursor="Shop" className="pl-btn pl-btn-primary group">
            Shop Posters
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/shop?type=keychains" className="pl-btn pl-btn-ghost-dark">Shop Keychains</Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, duration: 0.6 }}
          className="mt-16 flex flex-wrap gap-8 md:gap-16 text-white/60 text-xs uppercase tracking-widest"
        >
          <div><div className="font-display text-white text-2xl md:text-3xl font-tabular">250gsm</div>Museum matte</div>
          <div><div className="font-display text-white text-2xl md:text-3xl font-tabular">₹0</div>Delivery</div>
          <div><div className="font-display text-white text-2xl md:text-3xl font-tabular">3-5d</div>Dispatch</div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="w-px h-10 bg-white/50" />
      </motion.div>
    </section>
  );
};

/* ── Testimonials & newsletter (unchanged, imported look) ─────────────── */
const Testimonials = ({ items }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 6500);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return null;
  const t = items[i];
  return (
    <div className="max-w-3xl mx-auto text-center">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-center gap-1 mb-4">{Array(t.rating || 5).fill(0).map((_, k) => <Star key={k} className="w-4 h-4 fill-[color:var(--pl-orange)] text-[color:var(--pl-orange)]" />)}</div>
          <p className="font-display text-2xl md:text-3xl leading-tight">"{t.quote}"</p>
          <div className="mt-6 text-[11px] uppercase tracking-widest text-white/60">— {t.name}{t.location ? ` · ${t.location}` : ""}</div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex items-center justify-center gap-6">
        <button onClick={() => setI((v) => (v - 1 + items.length) % items.length)} className="p-2 border border-white/20 hover:border-[color:var(--pl-orange)] hover:text-[color:var(--pl-orange)]" aria-label="Previous"><ChevronLeft className="w-4 h-4" /></button>
        <div className="flex gap-1">
          {items.map((_, k) => <button key={k} onClick={() => setI(k)} className={`w-6 h-0.5 ${k === i ? "bg-[color:var(--pl-orange)]" : "bg-white/20"}`} aria-label={`Slide ${k + 1}`} />)}
        </div>
        <button onClick={() => setI((v) => (v + 1) % items.length)} className="p-2 border border-white/20 hover:border-[color:var(--pl-orange)] hover:text-[color:var(--pl-orange)]" aria-label="Next"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/newsletter/subscribe", { email, source: "home_footer" });
      setDone(true); setEmail("");
      toast.success("You're on the list.");
    } catch { toast.error("Try again in a moment"); }
  };
  return (
    <form onSubmit={submit} className="mt-10 max-w-md mx-auto flex border-b border-white/30 pb-3">
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none px-2" data-testid="newsletter-email" />
      <button data-testid="newsletter-submit" className="text-white uppercase tracking-widest text-xs font-bold hover:text-[color:var(--pl-orange)]">{done ? "Subscribed ✓" : "Subscribe →"}</button>
    </form>
  );
};

/* ── Home ─────────────────────────────────────────────────────────────── */
const Home = () => {
  const [best, setBest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/products?best_seller=true&limit=8").then((r) => setBest(r.data));
    api.get("/products?trending=true&limit=8").then((r) => setTrending(r.data));
    api.get("/testimonials").then((r) => setTestimonials(r.data));
    api.get("/gallery").then((r) => setGallery(r.data));
  }, []);

  return (
    <div>
      <Hero />

      {/* Marquee */}
      <div className="bg-[color:var(--pl-orange)] text-white overflow-hidden border-y border-white/5">
        <div className="pl-marquee-track py-4">
          {Array(2).fill(0).map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0 px-6">
              {["Free shipping across India", "Museum-grade matte print", "Limited then gone", "New drops weekly", "Real editorial. No stock energy.", "Premium acrylic keychains"].map((t) => (
                <span key={t} className="font-display uppercase tracking-widest text-sm whitespace-nowrap">◆ {t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Two categories: Posters + Keychains */}
      <section className="pl-section-light py-24 md:py-32">
        <div className="pl-container">
          <FadeUp>
            <div className="text-[11px] tracking-[0.28em] uppercase text-neutral-500 mb-4">01 · The Store</div>
            <h2 className="font-display text-editorial uppercase mb-14">Two things.<br />Done <span className="text-[color:var(--pl-orange)]">right.</span></h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {[
              { type: "posters", label: "Posters", desc: "Museum matte. Archival ink. Wall-defining art.", img: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600" },
              { type: "keychains", label: "Acrylic Keychains", desc: "Double-sided print. Steel loop. Pocket flex.", img: "https://images.unsplash.com/photo-1607081692251-b8b7fdd4f6ff?w=1600" },
            ].map((c, i) => (
              <FadeUp key={c.type} delay={i * 0.1}>
                <Link
                  to={`/shop?type=${c.type}`}
                  data-testid={`home-cat-${c.type}`}
                  data-cursor="Shop"
                  className="group relative block aspect-[4/5] md:aspect-[5/6] overflow-hidden bg-black"
                >
                  <img src={c.img} alt={c.label} className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[900ms]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 text-white">
                    <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2">Category · 0{i + 1}</div>
                    <div className="font-display text-4xl md:text-6xl uppercase leading-none flex items-center gap-3">
                      {c.label}
                      <ArrowUpRight className="w-8 h-8 md:w-10 md:h-10 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <p className="mt-4 text-white/70 max-w-xs">{c.desc}</p>
                  </div>
                </Link>
              </FadeUp>
            ))}
            {/* Coming Soon */}
            <FadeUp delay={0.2} className="md:col-span-2">
              <div className="relative overflow-hidden bg-neutral-100 border border-neutral-200 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-[color:var(--pl-orange)] mb-2">Season 2026</div>
                  <h3 className="font-display uppercase text-3xl md:text-5xl">Printed T-Shirts<span className="text-[color:var(--pl-orange)]">.</span></h3>
                  <p className="text-neutral-500 mt-3 max-w-md">First capsule dropping later this year. Get notified before anyone else.</p>
                </div>
                <button onClick={() => nav("/coming-soon")} className="pl-btn pl-btn-dark">Notify Me →</button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="pl-section-dark py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,106,0,0.1), transparent 60%)" }} />
        <div className="pl-container relative z-10">
          <div className="flex items-end justify-between mb-12">
            <FadeUp>
              <div className="text-[11px] tracking-[0.28em] uppercase text-white/50 mb-4">02 · Best Sellers</div>
              <h2 className="font-display text-editorial uppercase text-white">Flew off <br />the <span className="text-[color:var(--pl-orange)]">shelf.</span></h2>
            </FadeUp>
            <Link to="/shop" className="hidden md:inline-flex pl-btn pl-btn-ghost-dark">All Drops <ArrowUpRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {best.slice(0, 4).map((p, i) => (
              <div key={p.id} className="text-white"><ProductCard product={p} index={i} dark /></div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="pl-section-light py-24 md:py-32">
        <div className="pl-container">
          <FadeUp>
            <div className="text-[11px] tracking-[0.28em] uppercase text-neutral-500 mb-4">03 · Trending</div>
            <h2 className="font-display text-editorial uppercase mb-12">On everyone's wall <span className="text-[color:var(--pl-orange)]">this week.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {trending.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="pl-section-light pb-24">
        <div className="pl-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-neutral-200 pt-12">
            {[
              { n: "01", t: "Museum Print", d: "250gsm matte, archival ink. Won't yellow, won't crack." },
              { n: "02", t: "Free Delivery", d: "Across India. Always. No fine print." },
              { n: "03", t: "Secure UPI", d: "Scan, pay, track. No cards ever stored." },
              { n: "04", t: "Fast Dispatch", d: "In your hands in 3-5 days. No drop lies." },
            ].map((f, i) => (
              <FadeUp key={f.n} delay={i * 0.08}>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-4">{f.n}</div>
                  <div className="font-display uppercase text-lg mb-2">{f.t}</div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{f.d}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="pl-section-gray py-24 md:py-32">
          <div className="pl-container">
            <FadeUp>
              <div className="text-[11px] tracking-[0.28em] uppercase text-neutral-500 mb-4">04 · #PaperAndLoop</div>
              <h2 className="font-display text-editorial uppercase mb-12">On real <br /><span className="text-[color:var(--pl-orange)]">walls.</span></h2>
            </FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {gallery.slice(0, 12).map((g, i) => (
                <motion.a
                  key={g.id}
                  href={g.link_url || "#"}
                  target="_blank" rel="noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-square overflow-hidden bg-neutral-200"
                  data-cursor="Open"
                >
                  <img src={resolveMedia(g.image_url)} alt={g.caption || ""} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="pl-section-dark py-24 md:py-32">
          <div className="pl-container text-white">
            <FadeUp>
              <div className="text-center text-[11px] tracking-[0.28em] uppercase text-white/50 mb-4">05 · Word on the wall</div>
              <Testimonials items={testimonials} />
            </FadeUp>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="pl-section-dark py-24 md:py-32 border-t border-white/10">
        <div className="pl-container text-center">
          <FadeUp>
            <div className="text-[11px] tracking-[0.28em] uppercase text-[color:var(--pl-orange)] mb-4">Drop Alerts</div>
            <h2 className="font-display text-editorial uppercase text-white max-w-3xl mx-auto">First to <br />know, <span className="text-[color:var(--pl-orange)]">first to own.</span></h2>
            <NewsletterForm />
            <p className="mt-3 text-white/40 text-xs uppercase tracking-widest">No spam. Only drops.</p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
};

export default Home;
