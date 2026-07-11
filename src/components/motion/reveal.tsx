"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, className, delay = 0, y = 18 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const shouldReduceMotion = useReducedMotion();
  return <motion.div className={className} initial={shouldReduceMotion ? false : { opacity: 0, y }} whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-48px" }} transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function FloatIn({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  return <motion.div className={className} initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 22 }} animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.12 }}>{children}</motion.div>;
}
