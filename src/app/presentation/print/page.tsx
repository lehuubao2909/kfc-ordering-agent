/**
 * Bản in PDF: mọi slide xếp dọc, mỗi slide = 1 trang PDF 1280×720 (khớp @page trong CSS).
 * 2 phiên bản: `?version=submission` = 7 trang deck chính (bản NỘP, kết thúc ở Thanks) ·
 * mặc định = full 18 trang gồm appendix A1–A8 + Q&A prep (bản NỘI BỘ).
 * Xuất: chạy scripts/export-slides-pdf.sh (headless Chrome → 2 file PDF trong public/).
 */
import type { Metadata } from "next";
import { mainDeckSlides } from "@/components/presentation/main-deck-slides";
import { appendixSlidesA } from "@/components/presentation/appendix-slides-a";
import { appendixSlidesB } from "@/components/presentation/appendix-slides-b";

export const metadata: Metadata = { title: "Print · KFC Ordering Agent Deck", robots: { index: false } };

export default async function PresentationPrintPage({ searchParams }: { searchParams: Promise<{ version?: string }> }) {
  const { version } = await searchParams;
  const slides = version === "submission"
    ? mainDeckSlides
    : [...mainDeckSlides, ...appendixSlidesA, ...appendixSlidesB];

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
