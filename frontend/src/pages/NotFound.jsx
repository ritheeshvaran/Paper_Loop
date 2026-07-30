import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="pl-section-dark min-h-[80vh] flex items-center justify-center text-white overflow-hidden relative">
    <div className="pl-container text-center relative z-10">
      <div className="text-[11px] uppercase tracking-widest text-[color:var(--pl-orange)] mb-4">404</div>
      <h1 className="font-display uppercase text-hero leading-none">Poster<br />came <span className="text-[color:var(--pl-orange)]">unstuck.</span></h1>
      <p className="mt-6 text-white/60 max-w-md mx-auto">That page peeled off the wall. Try a category or head back home.</p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link to="/" className="pl-btn pl-btn-primary">Home</Link>
        <Link to="/collections" className="pl-btn pl-btn-ghost-dark">Collections</Link>
      </div>
    </div>
  </div>
);
export default NotFound;
