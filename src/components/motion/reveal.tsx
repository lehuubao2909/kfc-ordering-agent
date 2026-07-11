/**
 * Hiệu ứng fade-up khi vào trang — CSS thuần (.reveal-fade-up trong globals.css), KHÔNG dùng motion/JS.
 * Bài học 12/7: bản motion cũ SSR opacity:0 rồi chờ hydrate + IntersectionObserver mới hiện —
 * máy nào JS trục trặc (extension/chunk fail/incognito chặn) là trang TRẮNG vĩnh viễn dù HTML đầy đủ.
 * CSS animation chạy không cần JS → fail-open: tệ nhất vẫn hiện đủ nội dung.
 */
import type { CSSProperties, ReactNode } from "react";

type RevealVars = CSSProperties & { "--reveal-delay"?: string; "--reveal-y"?: string; "--reveal-scale"?: string };

export function Reveal({ children, className = "", delay = 0, y = 18 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const vars: RevealVars = { "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` };
  return <div className={`reveal-fade-up ${className}`} style={vars}>{children}</div>;
}

export function FloatIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  const vars: RevealVars = { "--reveal-delay": "0.12s", "--reveal-y": "22px", "--reveal-scale": "0.96" };
  return <div className={`reveal-fade-up ${className}`} style={vars}>{children}</div>;
}
