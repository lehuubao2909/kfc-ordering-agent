"use client";

import { useEffect, useRef } from "react";
import type { MockConversation } from "@/lib/mock/mock-data-types";
import { maskSensitiveText } from "@/lib/mock/mask-sensitive-text";

export function TranscriptViewer({ conversation }: { conversation: MockConversation }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageCount = conversation.history.length;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    });

    return () => cancelAnimationFrame(frame);
  }, [conversation.psid, messageCount]);

  return (
    <div
      ref={scrollRef}
      className="chat-scrollbar h-[min(58dvh,460px)] min-h-[320px] max-h-[460px] w-full min-w-0 max-w-full flex-none touch-pan-y overflow-y-scroll overscroll-contain bg-[#f7f7f5] px-3 py-5 [-webkit-overflow-scrolling:touch] sm:h-[460px] sm:px-6 lg:h-[500px] lg:max-h-[500px] xl:h-[540px] xl:max-h-[540px]"
      aria-live="polite"
      tabIndex={0}
      aria-label={`Nội dung hội thoại với ${conversation.customerName}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-2xl space-y-3 pb-2">
        {conversation.history.map((message, index) =>
          message.role === "system" ? (
            <div key={`${index}-${message.content}`} className="min-w-0 py-2 text-center">
              <span className="inline-block max-w-full break-words rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600">
                {message.content}
              </span>
            </div>
          ) : (
            <div key={`${index}-${message.content}`} className={`flex min-w-0 ${message.role === "user" ? "justify-start" : "justify-end"}`}>
              <div
                className={`min-w-0 max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[72%] sm:px-4 sm:py-3 ${
                  message.role === "user" ? "rounded-bl-md bg-white text-zinc-800" : "rounded-br-md bg-zinc-900 text-white"
                }`}
              >
                <span className="break-words">{maskSensitiveText(message.content)}</span>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
