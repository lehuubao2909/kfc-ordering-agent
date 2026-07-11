"use client";

// Transcript từ message_log (nguồn chuẩn — KHÔNG dùng sessions.history): direction in = khách, out = bot/staff.
import { useEffect, useRef } from "react";
import { maskSensitiveText } from "@/components/shared/mask-sensitive-text";

export type TranscriptEntry = { direction: string; text: string; createdAt: string };

export function TranscriptViewer({ customerName, entries }: { customerName: string; entries: TranscriptEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageCount = entries.length;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [customerName, messageCount]);

  return (
    <div
      ref={scrollRef}
      className="chat-scrollbar h-[min(58dvh,460px)] min-h-[320px] max-h-[460px] w-full min-w-0 max-w-full flex-none touch-pan-y overflow-y-scroll overscroll-contain bg-[#f7f7f5] px-3 py-5 [-webkit-overflow-scrolling:touch] sm:h-[460px] sm:px-6 lg:h-[500px] lg:max-h-[500px] xl:h-[540px] xl:max-h-[540px]"
      aria-live="polite"
      tabIndex={0}
      aria-label={`Nội dung hội thoại với ${customerName}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-2xl space-y-3 pb-2">
        {entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">Chưa có tin nhắn — hội thoại sẽ hiện khi khách nhắn vào page.</p>
        ) : (
          entries.map((message, index) =>
            message.direction === "trace" ? (
              // Chuỗi tools agent gọi trong turn — bằng chứng agentic hiển thị (rubric AABW)
              <div key={`${index}-${message.createdAt}`} className="flex min-w-0 justify-center py-1">
                <span className="inline-flex max-w-full items-center gap-1.5 break-words rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-mono text-[11px] font-semibold text-violet-700">
                  <span aria-hidden="true">🔧</span>
                  <span className="break-all">{message.text}</span>
                </span>
              </div>
            ) : (
              <div key={`${index}-${message.createdAt}`} className={`flex min-w-0 ${message.direction === "in" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`min-w-0 max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[72%] sm:px-4 sm:py-3 ${
                    message.direction === "in" ? "rounded-bl-md bg-white text-zinc-800" : "rounded-br-md bg-zinc-900 text-white"
                  }`}
                >
                  <span className="break-words">{maskSensitiveText(message.text)}</span>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
