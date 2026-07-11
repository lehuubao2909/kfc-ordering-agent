import type { MenuItem, Order, OrderState, SessionMode } from "@/lib/types";

export type MockOrder = Order & { upsellAccepted: boolean };

export type TranscriptMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type MockConversation = {
  psid: string;
  customerName: string;
  state: OrderState;
  mode: SessionMode;
  activeOrderId: string | null;
  updatedAt: string;
  history: TranscriptMessage[];
};

export type AdminMetrics = {
  funnel: {
    conversationsStarted: number;
    reachedCart: number;
    confirmed: number;
    paid: number;
    delivered: number;
  };
  aov: {
    withoutUpsellVnd: number;
    withUpsellVnd: number;
    upliftPct: number;
    assumption: string;
  };
  upsell: { offered: number; accepted: number; acceptanceRatePct: number };
  nluEval: { passed: number; total: number; comment: string };
};

export type MenuLookup = Map<string, MenuItem>;
