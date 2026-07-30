import React, { useEffect, useRef } from "react";

/**
 * Premium custom cursor.
 * - Uses refs + rAF (never re-renders while moving → zero jitter)
 * - Ring lerps toward the pointer for buttery smoothness
 * - Grows over any interactive element; magnetic snap toward its center
 * - Shrinks on mouse-down
 * - Auto-disabled on touch, when typing, and when the page loses focus
 */
export const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)");
    if (coarse.matches) return;
    document.documentElement.classList.add("pl-cursor-hidden");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2, hover: false, down: false, label: "" };
    const ring = { x: target.x, y: target.y, scale: 1, opacity: 1 };
    const dot = { x: target.x, y: target.y };
    let hidden = false;

    const setLabel = (v) => {
      if (labelRef.current) {
        labelRef.current.textContent = v || "";
        labelRef.current.style.opacity = v ? "1" : "0";
      }
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target instanceof Element ? e.target : null;
      const cursorEl = el?.closest?.("[data-cursor]");
      const clickable = el?.closest?.("a, button, input, textarea, select, label, [role='button'], .pl-btn");
      const typable = el?.closest?.("input:not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']");
      target.hover = !!clickable;
      target.label = cursorEl?.getAttribute("data-cursor") || "";
      // Magnetic snap: pull ring toward center of small interactive elements
      if (clickable && !typable) {
        const r = clickable.getBoundingClientRect();
        if (r.width < 120 && r.height < 60) {
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          target.x = target.x + (cx - target.x) * 0.35;
          target.y = target.y + (cy - target.y) * 0.35;
        }
      }
      if (typable) hidden = true; else hidden = false;
    };

    const onDown = () => { target.down = true; };
    const onUp = () => { target.down = false; };
    const onLeave = () => { hidden = true; };
    const onEnter = () => { hidden = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("blur", onLeave);
    window.addEventListener("focus", onEnter);

    const lerp = (a, b, n) => a + (b - a) * n;

    const tick = () => {
      // Dot follows the pointer 1:1 (no lag)
      dot.x = target.x;
      dot.y = target.y;
      // Ring eases toward the pointer
      ring.x = lerp(ring.x, target.x, 0.22);
      ring.y = lerp(ring.y, target.y, 0.22);
      const wantScale = target.down ? 0.75 : target.hover ? 1.8 : 1;
      ring.scale = lerp(ring.scale, wantScale, 0.18);
      const wantOpacity = hidden ? 0 : 1;
      ring.opacity = lerp(ring.opacity, wantOpacity, 0.2);

      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${dot.x - 3}px, ${dot.y - 3}px, 0)`;
      if (dotRef.current)
        dotRef.current.style.opacity = wantOpacity ? "1" : "0";
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x - 18}px, ${ring.y - 18}px, 0) scale(${ring.scale})`;
        ringRef.current.style.opacity = String(ring.opacity);
        ringRef.current.style.background = target.hover && !target.down ? "rgba(255,106,0,0.14)" : "transparent";
      }
      setLabel(target.hover ? target.label : "");
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("focus", onEnter);
      document.documentElement.classList.remove("pl-cursor-hidden");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="fixed left-0 top-0 z-[9999] pointer-events-none w-1.5 h-1.5 rounded-full bg-[color:var(--pl-orange)]"
        style={{ willChange: "transform", transition: "opacity 200ms ease" }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="fixed left-0 top-0 z-[9998] pointer-events-none w-9 h-9 rounded-full border border-[color:var(--pl-orange)]"
        style={{ willChange: "transform, background-color, opacity", transformOrigin: "center", transition: "background-color 180ms ease" }}
      >
        <span
          ref={labelRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[10px] uppercase tracking-widest font-bold text-[color:var(--pl-orange)] whitespace-nowrap"
          style={{ opacity: 0, transition: "opacity 180ms ease" }}
        />
      </div>
    </>
  );
};
