"use client";

/**
 * Viewer slide: scale 1280×720 vừa màn hình, chuyển slide bằng phím ←/→/Space, click 2 nửa màn,
 * nút fullscreen (F), counter + progress. Animation fade/slide nhẹ bằng motion (đã có sẵn dep).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SLIDE_W, SLIDE_H } from "./slide-frame";
import { mainDeckSlides } from "./main-deck-slides";
import { appendixSlidesA } from "./appendix-slides-a";
import { appendixSlidesB } from "./appendix-slides-b";

const slides = [...mainDeckSlides, ...appendixSlidesA, ...appendixSlidesB];

export function PresentationViewer() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [scale, setScale] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const go = useCallback((delta: number) => {
    setDirection(delta);
    setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));
  }, []);

  // Scale slide 1280×720 khớp viewport (giữ tỉ lệ, chừa lề)
  useEffect(() => {
    const fit = () => {
      const el = shellRef.current;
      if (!el) return;
      const pad = isFullscreen ? 0 : 48;
      setScale(Math.min((el.clientWidth - pad) / SLIDE_W, (el.clientHeight - pad) / SLIDE_H));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [isFullscreen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Home") setIndex(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else shellRef.current?.requestFullscreen();
  }

  return (
    <div ref={shellRef} className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#0C1220]">
      {/* Ẩn skip-link của layout gốc — không thuộc màn trình chiếu */}
      <style>{`.skip-link { display: none !important; }`}</style>
      {/* Vùng click 2 nửa để chuyển slide */}
      <button aria-label="Slide trước" onClick={() => go(-1)} className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-w-resize opacity-0" />
      <button aria-label="Slide sau" onClick={() => go(1)} className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-e-resize opacity-0" />

      {/* Scale ở div NGOÀI (tĩnh) — motion quản lý transform riêng ở div trong, không được gộp
          scale vào motion.div (motion sẽ đè transform → slide vỡ khổ, dính góc — bug 11/7 tối). */}
      <div style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }} className="relative overflow-hidden rounded-lg shadow-[0_30px_90px_rgb(0_0_0_/_0.5)]">
        <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: 60 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * direction }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ width: SLIDE_W, height: SLIDE_H }}
            >
              {slides[index]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Thanh điều khiển */}
      <div className="absolute bottom-4 z-20 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
        <button onClick={() => go(-1)} disabled={index === 0} className="rounded-full px-3 py-1.5 text-sm font-black text-white hover:bg-white/15 disabled:opacity-30">←</button>
        <span className="min-w-[64px] text-center font-mono text-sm font-bold text-white/80">{index + 1} / {slides.length}</span>
        <button onClick={() => go(1)} disabled={index === slides.length - 1} className="rounded-full px-3 py-1.5 text-sm font-black text-white hover:bg-white/15 disabled:opacity-30">→</button>
        <span className="mx-1 h-4 w-px bg-white/20" />
        <button onClick={toggleFullscreen} className="rounded-full px-3 py-1.5 text-sm font-black text-white hover:bg-white/15">{isFullscreen ? "Thoát ⛶" : "Fullscreen ⛶"}</button>
        <a href="/kfc-ordering-agent-slides.pdf" target="_blank" className="rounded-full px-3 py-1.5 text-sm font-black text-[#F2A33C] hover:bg-white/15">PDF ↓</a>
      </div>

      {/* Progress */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10"><div className="h-full bg-[#C8102E] transition-all duration-300" style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></div>
    </div>
  );
}
