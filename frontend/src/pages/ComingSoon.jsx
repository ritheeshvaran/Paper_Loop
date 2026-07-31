import React from "react";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/Reveal";
import { brandAsset } from "@/lib/assets";

const items = [
  { title: "Oversized Tees", tag: "Season 2026", asset: "comingSoonTees" },
  { title: "Heavy Hoodies", tag: "Season 2026", asset: "comingSoonHoodies" },
  { title: "Accessories", tag: "Late 2026", asset: "comingSoonAccessories" },
];

const ComingSoon = () => (
  <div className="pl-section-dark min-h-screen">
    <div className="pl-container py-24">
      <FadeUp>
        <div className="text-[11px] tracking-[0.25em] uppercase text-[color:var(--pl-orange)] mb-4">Not yet, but soon.</div>
        <h1 className="font-display uppercase text-editorial text-white">Wear the <br /><span className="text-[color:var(--pl-orange)]">brand.</span></h1>
        <p className="mt-6 text-white/70 max-w-xl">Get notified when each capsule drops. First to know, first to own.</p>
      </FadeUp>

      <div className="mt-16 grid md:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="group relative overflow-hidden bg-neutral-900"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img src={brandAsset(it.asset)} alt={it.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>
            <div className="p-6">
              <div className="text-[10px] uppercase tracking-widest text-[color:var(--pl-orange)]">{it.tag}</div>
              <div className="font-display uppercase text-2xl text-white mt-1">{it.title}</div>
              <form onSubmit={(e) => { e.preventDefault(); e.target.reset(); }} className="mt-4 flex border-b border-white/30 pb-2">
                <input required type="email" placeholder="your@email.com" className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm" />
                <button className="text-white uppercase tracking-widest text-[10px] font-bold hover:text-[color:var(--pl-orange)]">Notify Me →</button>
              </form>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
export default ComingSoon;
