import React from "react";
import { motion } from "framer-motion";

export const RevealText = ({ children, delay = 0, as: Tag = "div", className = "" }) => (
  <Tag className={`pl-mask ${className}`}>
    <motion.span
      initial={{ y: "100%" }}
      whileInView={{ y: "0%" }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.span>
  </Tag>
);

export const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);
