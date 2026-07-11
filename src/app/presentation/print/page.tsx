/**
 * Bản in PDF: mọi slide xếp dọc, mỗi slide = 1 trang PDF 1280×720 (khớp @page trong CSS).
 * Xuất: chạy scripts/export-slides-pdf.sh (headless Chrome → public/kfc-ordering-agent-slides.pdf).
 */
import type { Metadata } from "next";
import { mainDeckSlides } from "@/components/presentation/main-deck-slides";
import { appendixSlidesA } from "@/components/presentation/appendix-slides-a";
import { appendixSlidesB } from "@/components/presentation/appendix-slides-b";

export const metadata: Metadata = { title: "Print · KFC Ordering Agent Deck", robots: { index: false } };

const slides = [...mainDeckSlides, ...appendixSlidesA, ...appendixSlidesB];

export default function PresentationPrintPage() {
  return (
    <>
      {/* @page khớp đúng kích thước slide để mỗi section = 1 trang PDF, không header/footer */}
      <style>{`@page { size: 1280px 720px; margin: 0; } body { margin: 0; } .print-slide { page-break-after: always; break-inside: avoid; } .skip-link { display: none !important; }`}</style>
      <main>
        {slides.map((s, i) => (
          <div key={i} className="print-slide">{s}</div>
        ))}
      </main>
    </>
  );
}
