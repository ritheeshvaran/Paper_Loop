import React from "react";
import { Link } from "react-router-dom";
import { FadeUp } from "@/components/Reveal";

const About = () => (
  <div className="pl-section-light">
    <div className="relative min-h-[70vh] bg-[color:var(--pl-black)] text-white flex items-end overflow-hidden">
      <img src="https://images.unsplash.com/photo-1523585298601-d46ae038d7d3?w=1800" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      <div className="pl-container relative z-10 py-24">
        <div className="text-[11px] tracking-[0.25em] uppercase text-[color:var(--pl-orange)] mb-4">About Paper &amp; Loop</div>
        <h1 className="font-display uppercase text-editorial">We print <br />what you'd <br /><span className="text-[color:var(--pl-orange)]">actually hang.</span></h1>
      </div>
    </div>

    <div className="pl-container py-24 grid md:grid-cols-2 gap-16">
      <FadeUp>
        <h2 className="font-display uppercase text-3xl">The Story</h2>
        <p className="mt-6 text-neutral-700 leading-relaxed">
          Paper &amp; Loop started with a room full of walls and nothing worth putting on them. Every "poster site" felt like a stock-photo marketplace — cheap paper, cheaper design, and zero energy. So we built the opposite.
        </p>
        <p className="mt-4 text-neutral-700 leading-relaxed">
          Museum-grade matte paper. Editorial photography. Drops that arrive, sell out, and move on. No infinite catalog. No filler.
        </p>
      </FadeUp>
      <FadeUp delay={0.15}>
        <h2 className="font-display uppercase text-3xl">Mission</h2>
        <p className="mt-6 text-neutral-700 leading-relaxed">
          Give the ones who curate their space with intent — the anime obsessives, the JDM heads, the gamers, the collectors — a place that speaks their language and treats them like they know what they want. Because they do.
        </p>
        <Link to="/shop" className="pl-btn pl-btn-dark mt-8">Shop the Drops</Link>
      </FadeUp>
    </div>
  </div>
);
export default About;
