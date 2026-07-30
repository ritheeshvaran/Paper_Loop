import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Custom cursor: dot + trailing ring (desktop only). */
export const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("pl-cursor-hidden");

    let raf;
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    const overCheck = (e) => {
      const el = e.target.closest?.("[data-cursor]");
      if (el) {
        setHovering(true);
        setLabel(el.getAttribute("data-cursor") || "");
      } else {
        const clickable = e.target.closest?.("a, button, [role='button'], .pl-btn");
        setHovering(!!clickable);
        setLabel("");
      }
    };
    window.addEventListener("mousemove", (e) => { move(e); overCheck(e); });
    // Ring follows with lag
    const tick = () => {
      setRingPos((r) => ({ x: r.x + (pos.x - r.x) * 0.18, y: r.y + (pos.y - r.y) * 0.18 }));
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("pl-cursor-hidden");
    };
    // eslint-disable-next-line
  }, [pos.x, pos.y]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      <div
        style={{ transform: `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0)` }}
        className="fixed left-0 top-0 z-[9999] pointer-events-none w-2 h-2 rounded-full bg-[color:var(--pl-orange)] mix-blend-difference"
      />
      <motion.div
        animate={{ scale: hovering ? 1.6 : 1, backgroundColor: hovering ? "rgba(255,106,0,0.15)" : "rgba(255,106,0,0)" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        style={{ transform: `translate3d(${ringPos.x - 18}px, ${ringPos.y - 18}px, 0)` }}
        className="fixed left-0 top-0 z-[9998] pointer-events-none w-9 h-9 rounded-full border border-[color:var(--pl-orange)]"
      >
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[10px] uppercase tracking-widest font-bold text-[color:var(--pl-orange)] whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
