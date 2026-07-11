import type { Metadata } from "next";
import { PresentationViewer } from "@/components/presentation/presentation-viewer";

export const metadata: Metadata = {
  title: "Pitch Deck · KFC Ordering Agent",
  robots: { index: false }, // deck nội bộ team — không cần index
};

// Điều khiển: ←/→/Space chuyển slide · F fullscreen · click 2 mép màn hình
export default function PresentationPage() {
  return <PresentationViewer />;
}
